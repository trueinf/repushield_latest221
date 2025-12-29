// Main processing workflow: Fetch → Score → Store → Evidence/Response
import { fetchTwitterPosts, fetchRedditPosts, fetchNewsPosts, fetchFacebookPosts, type Post, type MediaItem } from './services';
import { scorePost, scoreToSentiment } from './agents/scoring';
import { collectEvidence, type EvidenceResult } from './agents/evidence';
import { generateAdminResponse } from './agents/adminResponse';
import { storePost, storeEntities, storeMedia, storeEvidence, storeAdminResponse } from './database/operations';
import type { PostRow, EntityRow, MediaRow } from './database/supabase';

// Extended post data with all metadata for storage
export interface ExtendedPostData extends Omit<Post, 'media'> {
  // Twitter-specific fields
  rest_id?: string;
  id_str?: string;
  conversation_id_str?: string;
  lang?: string;
  display_text_range?: [number, number];
  source?: string;
  favorite_count?: number;
  retweet_count?: number;
  reply_count?: number;
  quote_count?: number;
  view_count?: number;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  in_reply_to_screen_name?: string;
  is_quote_status?: boolean;
  
  // User fields
  user_rest_id?: string;
  user_avatar_url?: string;
  user_bio?: string;
  user_banner_url?: string;
  user_location?: string;
  user_followers_count?: number;
  user_friends_count?: number;
  user_statuses_count?: number;
  user_media_count?: number;
  user_favourites_count?: number;
  user_verified?: boolean;
  user_is_blue_verified?: boolean;
  user_protected?: boolean;
  user_account_created_at?: Date;
  
  // Entities and media - use MediaItem from Post for compatibility
  entities?: EntityRow[];
  media?: MediaItem[]; // Keep as MediaItem[] for compatibility with Post interface
  
  // Raw API response for platform-specific fields
  raw_data?: any;
}

// Process and store all posts with full workflow
export async function processAndStorePosts(keyword: string): Promise<{ posts: Post[]; errors: string[] }> {
  const errors: string[] = [];
  
  // Fetch posts from all sources (updated to 20 for Twitter, Reddit, News)
  const [twitterResult, redditResult, newsResult, facebookResult] = await Promise.allSettled([
    fetchTwitterPosts(keyword),
    fetchRedditPosts(keyword),
    fetchNewsPosts(keyword),
    fetchFacebookPosts(keyword),
  ]);

  const allPosts: Post[] = [];
  
  if (twitterResult.status === 'fulfilled') {
    allPosts.push(...twitterResult.value);
  } else {
    errors.push(`Twitter: ${twitterResult.reason?.message || 'Failed to fetch'}`);
  }

  if (redditResult.status === 'fulfilled') {
    allPosts.push(...redditResult.value);
  } else {
    errors.push(`Reddit: ${redditResult.reason?.message || 'Failed to fetch'}`);
  }

  if (newsResult.status === 'fulfilled') {
    allPosts.push(...newsResult.value);
  } else {
    errors.push(`News: ${newsResult.reason?.message || 'Failed to fetch'}`);
  }

  if (facebookResult.status === 'fulfilled') {
    allPosts.push(...facebookResult.value);
  } else {
    errors.push(`Facebook: ${facebookResult.reason?.message || 'Failed to fetch'}`);
  }

  // Step 1: Score and store all posts
  const processedPosts: Post[] = [];
  const highRiskPosts: Array<{ post: Post; score: number }> = [];
  
  for (const post of allPosts) {
    try {
      // Score the post
      const score = await scorePost(post.content, post.platform);
      const sentiment = scoreToSentiment(score);
      
      // Update post with score
      post.riskScore = score;
      post.sentiment = sentiment;
      
      // Convert Post to PostRow for database storage
      const postRow = convertPostToPostRow(post, keyword);
      
      // Store post in database
      await storePost(postRow);
      
      // Store entities (hashtags) if available
      const entitiesToStore: EntityRow[] = [];
      if (post.hashtags && post.hashtags.length > 0) {
        for (const hashtag of post.hashtags) {
          entitiesToStore.push({
            post_id: post.id,
            entity_type: 'hashtag',
            text: hashtag,
            indices: null,
            url: null,
            expanded_url: null,
            display_url: null,
          });
        }
      }
      
      // Also store entities from extended post data (if any)
      const extendedPost = post as unknown as ExtendedPostData;
      if (extendedPost.entities && extendedPost.entities.length > 0) {
        entitiesToStore.push(...extendedPost.entities);
      }
      
      if (entitiesToStore.length > 0) {
        await storeEntities(post.id, entitiesToStore);
      }
      
      // Store media if available
      const mediaToStore: MediaRow[] = [];
      if (post.media && post.media.length > 0) {
        for (const mediaItem of post.media) {
          mediaToStore.push({
            post_id: post.id,
            media_url_https: mediaItem.url,
            media_type: mediaItem.type === 'image' ? 'photo' : 
                       (mediaItem.type === 'video' ? 'video' : 'gif'),
            width: null,
            height: null,
            video_variants: null,
          });
        }
      }
      
      // Also store media from extended post data (if any)
      // Remove thumbnail_url if present since database schema doesn't include it
      if (extendedPost.media && extendedPost.media.length > 0) {
        for (const m of extendedPost.media) {
          const mediaRow: MediaRow = {
            post_id: post.id,
            media_url_https: m.media_url_https || null,
            media_type: m.media_type || null,
            width: m.width || null,
            height: m.height || null,
            video_variants: m.video_variants || null,
          };
          mediaToStore.push(mediaRow);
        }
      }
      
      if (mediaToStore.length > 0) {
        await storeMedia(post.id, mediaToStore);
      }
      
      // Collect high-risk posts for parallel processing
      if (score >= 8) {
        highRiskPosts.push({ post, score });
      }
      
      processedPosts.push(post);
    } catch (error: any) {
      console.error(`Error processing post ${post.id}:`, error.message);
      errors.push(`Post ${post.id}: ${error.message}`);
      // Still include post in results even if storage fails
      processedPosts.push(post);
    }
  }

  // Step 2: Process high-risk posts in parallel (evidence collection and response generation)
  if (highRiskPosts.length > 0) {
    console.log(`Processing ${highRiskPosts.length} high-risk posts in parallel...`);
    
    // Collect evidence for all high-risk posts in parallel
    const evidenceResults = await Promise.allSettled(
      highRiskPosts.map(({ post }) => collectEvidence(post.content))
    );

    // Generate responses for all high-risk posts in parallel (using collected evidence)
    const responseResults = await Promise.allSettled(
      highRiskPosts.map(({ post, score }, index) => {
        const evidenceResult = evidenceResults[index];
        const evidence: EvidenceResult[] = evidenceResult.status === 'fulfilled' ? evidenceResult.value : [];
        
        return generateAdminResponse(post.content, score, evidence);
      })
    );

    // Store all evidence and responses
    for (let i = 0; i < highRiskPosts.length; i++) {
      const { post } = highRiskPosts[i];
      const evidenceResult = evidenceResults[i];
      const responseResult = responseResults[i];

      try {
        // Store evidence if collection succeeded
        if (evidenceResult.status === 'fulfilled' && evidenceResult.value.length > 0) {
          for (const ev of evidenceResult.value) {
            await storeEvidence({
              post_id: post.id,
              source: 'serpapi_google_ai',
              title: ev.title,
              url: ev.url,
              snippet: ev.snippet || ev.text_block || undefined,
              evidence_data: ev,
            });
          }
        } else if (evidenceResult.status === 'rejected') {
          console.error(`Error collecting evidence for post ${post.id}:`, evidenceResult.reason?.message);
        }

        // Store admin response if generation succeeded
        if (responseResult.status === 'fulfilled' && responseResult.value) {
          await storeAdminResponse({
            post_id: post.id,
            response_text: responseResult.value,
            generated_by: 'openai',
            model_used: 'gpt-4o-mini',
          });
        } else if (responseResult.status === 'rejected') {
          console.error(`Error generating response for post ${post.id}:`, responseResult.reason?.message);
        }
      } catch (error: any) {
        console.error(`Error storing evidence/response for post ${post.id}:`, error.message);
        errors.push(`Post ${post.id} evidence/response: ${error.message}`);
      }
    }
  }

  // Sort by timestamp (newest first)
  processedPosts.sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return bTime - aTime;
  });

  return { posts: processedPosts, errors };
}

// Convert Post interface to PostRow for database
function convertPostToPostRow(post: Post, entity: string): PostRow {
  const extendedPost = post as unknown as ExtendedPostData;
  // Try to parse timestamp, fallback to current date if parsing fails
  let timestamp: Date;
  try {
    // Try parsing the timestamp string
    timestamp = new Date(post.timestamp);
    // If parsing resulted in invalid date, use current date
    if (isNaN(timestamp.getTime())) {
      timestamp = new Date();
    }
  } catch {
    timestamp = new Date();
  }
  
  return {
    id: post.id,
    platform: post.platform,
    entity: entity,
    rest_id: extendedPost.rest_id || null,
    id_str: extendedPost.id_str || null,
    conversation_id_str: extendedPost.conversation_id_str || null,
    full_text: post.content,
    lang: extendedPost.lang || null,
    display_text_range: extendedPost.display_text_range ? JSON.stringify(extendedPost.display_text_range) : null,
    source: extendedPost.source || null,
    created_at: timestamp.toISOString(),
    favorite_count: extendedPost.favorite_count || null,
    retweet_count: extendedPost.retweet_count || null,
    reply_count: extendedPost.reply_count || null,
    quote_count: extendedPost.quote_count || null,
    view_count: extendedPost.view_count || null,
    in_reply_to_status_id_str: extendedPost.in_reply_to_status_id_str || null,
    in_reply_to_user_id_str: extendedPost.in_reply_to_user_id_str || null,
    in_reply_to_screen_name: extendedPost.in_reply_to_screen_name || null,
    is_quote_status: extendedPost.is_quote_status || null,
    user_rest_id: extendedPost.user_rest_id || null,
    user_name: post.author,
    user_screen_name: post.handle.replace('@', ''),
    user_avatar_url: extendedPost.user_avatar_url || null,
    user_bio: extendedPost.user_bio || null,
    user_banner_url: extendedPost.user_banner_url || null,
    user_location: extendedPost.user_location || null,
    user_followers_count: extendedPost.user_followers_count || null,
    user_friends_count: extendedPost.user_friends_count || null,
    user_statuses_count: extendedPost.user_statuses_count || null,
    user_media_count: extendedPost.user_media_count || null,
    user_favourites_count: extendedPost.user_favourites_count || null,
    user_verified: extendedPost.user_verified || post.badges.includes('Verified') || null,
    user_is_blue_verified: extendedPost.user_is_blue_verified || null,
    user_protected: extendedPost.user_protected || null,
    user_account_created_at: extendedPost.user_account_created_at?.toISOString() || null,
    platform_data: extendedPost.raw_data || null,
    score: Math.round(post.riskScore), // Ensure integer for database (1-10)
    sentiment: post.sentiment,
    reach: post.reach,
    engagement: post.engagement,
    url: post.url || null,
  };
}

