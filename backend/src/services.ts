// Shared services that can be used by both serverless functions and local server

export interface Post {
  id: string;
  platform: 'twitter' | 'reddit' | 'facebook' | 'news';
  author: string;
  handle: string;
  timestamp: string;
  content: string;
  riskScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  badges: string[];
  reach: number;
  engagement: number;
  entity: string;
  url?: string;
  hashtags?: string[]; // Extracted hashtags
  media?: MediaItem[]; // Media/images attached to the post
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'gif';
  thumbnail_url?: string;
}

// Helper function to generate mock risk score (placeholder)
export const getMockRiskScore = (): number => {
  return Math.floor(Math.random() * 100);
};

// Helper function to generate mock sentiment (placeholder)
export const getMockSentiment = (): 'positive' | 'neutral' | 'negative' => {
  const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
  return sentiments[Math.floor(Math.random() * sentiments.length)];
};

// Helper function to format timestamp
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
};

// Twitter Agent - RapidAPI twitter241
export async function fetchTwitterPosts(keyword: string): Promise<Post[]> {
  const items: Post[] = [];
  
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      console.warn('Twitter: RAPIDAPI_KEY not configured');
      return items;
    }

    const headers = {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': 'twitter241.p.rapidapi.com',
    };

    const params = new URLSearchParams({
      type: 'Top',
      count: '20',
      query: keyword,
    });

    const url = `https://twitter241.p.rapidapi.com/search?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (response.status !== 200) {
      console.warn(`Twitter HTTP ${response.status}: ${(await response.text().catch(() => '')).substring(0, 200)}`);
      return items;
    }

    const data = await response.json();

    // Debug: Log response structure for troubleshooting
    if (items.length === 0) {
      console.log(`Twitter API response structure (first 500 chars): ${JSON.stringify(data).substring(0, 500)}...`);
    }

    // Extract tweets from response - following Python implementation structure
    const tweets: any[] = [];
    if (typeof data === 'object' && data !== null && 'result' in data) {
      const result = data.result || {};
      if (typeof result === 'object' && 'timeline' in result) {
        const timeline = (result as any).timeline || {};
        const instructions = (timeline.instructions || []) as any[];
        for (const instruction of instructions) {
          if (instruction.type === 'TimelineAddEntries') {
            const entries = instruction.entries || [];
            for (const entry of entries) {
              const content = entry.content || {};
              if (content.entryType === 'TimelineTimelineItem') {
                tweets.push(entry);
              }
            }
          }
        }
      }
    }
    
    console.log(`Twitter: Found ${tweets.length} raw tweets in response`);

    // Process tweets
    for (let i = 0; i < Math.min(tweets.length, 20); i++) {
      const tweet_entry = tweets[i];
      if (typeof tweet_entry !== 'object' || tweet_entry === null) continue;

      // Extract tweet from the entry structure
      const content = tweet_entry.content || {};
      const itemContent = content.itemContent || {};
      const tweetResults = itemContent.tweet_results || {};
      let tweet = tweetResults.result || {};
      
      // Sometimes the tweet is nested differently - try alternate path
      if (!tweet || typeof tweet !== 'object' || Object.keys(tweet).length === 0) {
        tweet = tweetResults.tweet || tweetResults || {};
      }

      if (!tweet || typeof tweet !== 'object' || Object.keys(tweet).length === 0) {
        console.warn(`Twitter: Could not extract tweet from entry ${i}`);
        continue;
      }

      // Extract tweet information from legacy format
      const legacy = tweet.legacy || {};
      const text = legacy.full_text || '';
      const created_at = legacy.created_at || '';

      // Extract user information - following the actual API structure:
      // tweet.core.user_results.result.core.name and tweet.core.user_results.result.core.screen_name
      const user = tweet.core?.user_results?.result || {};
      const userCore = user.core || {};  // The core object inside user_results.result
      const userLegacy = user.legacy || {}; // Also check legacy as fallback
      
      // Get author name - try user_results.result.core.name first (as per user's reference)
      let author = userCore.name || userLegacy.name || user.name || userLegacy.display_name || user.display_name || '';
      
      // Get username - try user_results.result.core.screen_name first (as per user's reference)
      let username = userCore.screen_name || userLegacy.screen_name || user.screen_name || userLegacy.username || user.username || '';

      // If we still have empty author, try username as fallback
      if (!author && username) {
        author = username;
      }
      
      // Final fallback
      if (!author) {
        author = 'Unknown';
        console.warn(`Twitter: Could not extract author for tweet ${i}`);
        console.warn(`  user structure keys:`, Object.keys(user));
        console.warn(`  userCore keys:`, Object.keys(userCore));
        console.warn(`  userCore content:`, JSON.stringify(userCore).substring(0, 200));
      }

      const tweetId = tweet.rest_id || `tw_${i}`;

      // Handle timestamp
      let timestamp: Date | null = null;
      if (created_at) {
        try {
          timestamp = new Date(created_at);
          if (isNaN(timestamp.getTime())) timestamp = null;
        } catch {
          timestamp = null;
        }
      }

      if (!text.trim()) continue;

      // Extract engagement metrics from legacy object
      const favoriteCount = legacy.favorite_count || legacy.favoriteCount || 0;
      const retweetCount = legacy.retweet_count || legacy.retweetCount || 0;
      const replyCount = legacy.reply_count || legacy.replyCount || 0;
      const quoteCount = legacy.quote_count || legacy.quoteCount || 0;
      const viewCount = legacy.view_count || legacy.views?.count || 0; // Some APIs provide view count
      
      // Calculate total engagement (sum of all interactions)
      const totalEngagement = favoriteCount + retweetCount + replyCount + quoteCount;
      
      // Use view count if available, otherwise use follower count for reach estimate
      const followerCount = userLegacy.followers_count || userLegacy.followersCount || userCore.followers_count || 0;

      // Extract hashtags from entities
      const entities = legacy.entities || {};
      const hashtagsData = entities.hashtags || [];
      const hashtags: string[] = hashtagsData
        .map((h: any) => h.text || h.tag || '')
        .filter((tag: string) => tag.length > 0);

      // Extract media from entities
      const media: MediaItem[] = [];
      const mediaData = legacy.extended_entities?.media || legacy.entities?.media || [];
      for (const m of mediaData) {
        if (m.media_url_https || m.media_url) {
          const mediaUrl = m.media_url_https || m.media_url;
          const mediaType = m.type === 'photo' ? 'image' : 
                          (m.type === 'video' || m.type === 'animated_gif') ? 'video' : 'image';
          media.push({
            url: mediaUrl,
            type: mediaType as 'image' | 'video' | 'gif',
            thumbnail_url: m.media_url_https || m.media_url,
          });
        }
      }

      items.push({
        id: `tw_${tweetId}`,
        platform: 'twitter',
        author: author,
        handle: username ? `@${username}` : 'Unknown',
        timestamp: timestamp ? formatTimestamp(timestamp) : formatTimestamp(new Date()),
        content: text,
        riskScore: getMockRiskScore(),
        sentiment: getMockSentiment(),
        badges: userCore.verified || userLegacy.verified || user.verified ? ['Verified'] : [],
        reach: viewCount > 0 ? viewCount : (followerCount > 0 ? followerCount : 50000), // Use views if available, else followers
        engagement: totalEngagement > 0 ? totalEngagement : (favoriteCount + retweetCount || 1000), // Total engagement or likes+retweets
        entity: keyword,
        url: username && tweetId ? `https://twitter.com/${username}/status/${tweetId}` : undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        media: media.length > 0 ? media : undefined,
      });
    }

    console.log(`Twitter final count: ${items.length} posts for keyword: ${keyword}`);
    return items;

  } catch (error: any) {
    console.warn(`Twitter fetch error for ${keyword}:`, error.message || error);
    return items;
  }
}

// Reddit Agent - RapidAPI reddit34
export async function fetchRedditPosts(keyword: string): Promise<Post[]> {
  const items: Post[] = [];
  
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      console.warn('Reddit: RAPIDAPI_KEY not configured');
      return items;
    }

    const headers = {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': 'reddit34.p.rapidapi.com',
    };

    const url = `https://reddit34.p.rapidapi.com/getSearchPosts?query=${encodeURIComponent(keyword)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (response.status !== 200) {
      const errorText = (await response.text().catch(() => '')).substring(0, 200);
      console.warn(`Reddit HTTP ${response.status} for ${keyword}: ${errorText}`);
      if (response.status === 403) {
        console.warn('Reddit API subscription required. Please subscribe to reddit34 API on RapidAPI.');
      }
      return items;
    }

    const data = await response.json() as any;

    // Parse Reddit response - following Python implementation
    const raw = data.data || {};
    let posts = raw.posts || [];

    // If posts is not a list, try common fallbacks
    if (!Array.isArray(posts)) {
      posts = data.posts || data.results || data.data?.children || [];
    }

    // Process posts
    for (let i = 0; i < Math.min(posts.length, 20); i++) {
      const post = posts[i];
      const pData = (typeof post === 'object' && post !== null && 'data' in post) ? post.data : post;
      
      if (typeof pData !== 'object' || pData === null) continue;

      const title = pData.title || '(untitled)';
      const subreddit = pData.subreddit || pData.subreddit_name_prefixed || 'Unknown';
      const created = pData.created_utc || pData.createdAt || pData.created;

      // Get URL
      let url = pData.url || pData.full_link;
      const permalink = pData.permalink;
      if (!url && permalink) {
        url = `https://www.reddit.com${permalink}`;
      }
      // Construct best-effort permalink if still no URL
      if (!url && subreddit && pData.id) {
        const sr = subreddit.startsWith('r/') ? subreddit : `r/${subreddit}`;
        url = `https://www.reddit.com/${sr}/comments/${pData.id}/`;
      }

      // Convert timestamp
      let timestamp: Date | null = null;
      if (typeof created === 'number') {
        timestamp = new Date(created * 1000);
      } else if (typeof created === 'string') {
        try {
          timestamp = new Date(created.replace('Z', '+00:00'));
        } catch {
          timestamp = null;
        }
      }

      // Create text content (title + selftext if available)
      let text = title;
      const selftext = pData.selftext || '';
      if (selftext && selftext !== '[deleted]' && selftext !== '[removed]') {
        text += ` — ${selftext}`;
      }

      if (!text.trim()) continue;

      // Extract Reddit engagement metrics
      const upvotes = pData.ups || pData.upvotes || 0;
      const downvotes = pData.downs || pData.downvotes || 0;
      const score = pData.score || upvotes || 0;
      const numComments = pData.num_comments || pData.comment_count || pData.numComments || 0;
      const totalEngagement = score + numComments;
      const subredditSubscribers = pData.subreddit_subscribers || pData.subscribers || 0;

      // Extract hashtags from text (Reddit uses #hashtag format)
      const hashtagRegex = /#[\w]+/g;
      const hashtagMatches = text.match(hashtagRegex) || [];
      const hashtags: string[] = hashtagMatches
        .map((tag: string) => tag.substring(1)) // Remove # symbol
        .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index); // Remove duplicates

      // Extract media/images from Reddit post
      const media: MediaItem[] = [];
      // Reddit images can be in preview.images or url (if it's an image)
      if (pData.preview?.images && Array.isArray(pData.preview.images)) {
        for (const img of pData.preview.images) {
          const imageUrl = img.source?.url || img.url;
          if (imageUrl) {
            // Decode HTML entities in URL
            const decodedUrl = imageUrl.replace(/&amp;/g, '&');
            media.push({
              url: decodedUrl,
              type: 'image',
              thumbnail_url: decodedUrl,
            });
          }
        }
      }
      // Also check if the post URL itself is an image
      if (pData.url && (pData.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || pData.post_hint === 'image')) {
        media.push({
          url: pData.url,
          type: 'image',
          thumbnail_url: pData.url,
        });
      }
      // Check for gallery (Reddit galleries)
      if (pData.gallery_data?.items && pData.media_metadata) {
        for (const item of pData.gallery_data.items) {
          const mediaId = item.media_id;
          const mediaInfo = pData.media_metadata[mediaId];
          if (mediaInfo?.s?.u) {
            media.push({
              url: mediaInfo.s.u.replace(/&amp;/g, '&'),
              type: 'image',
              thumbnail_url: mediaInfo.s.u.replace(/&amp;/g, '&'),
            });
          }
        }
      }

      items.push({
        id: `reddit_${pData.id || `post_${i}`}`,
        platform: 'reddit',
        author: subreddit,
        handle: subreddit.startsWith('r/') ? subreddit : `r/${subreddit}`,
        timestamp: timestamp ? formatTimestamp(timestamp) : formatTimestamp(new Date()),
        content: text,
        riskScore: getMockRiskScore(),
        sentiment: getMockSentiment(),
        badges: [],
        reach: subredditSubscribers > 0 ? subredditSubscribers : 10000, // Use subreddit subscribers if available
        engagement: totalEngagement > 0 ? totalEngagement : (score || 500), // Score + comments
        entity: keyword,
        url: url,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        media: media.length > 0 ? media : undefined,
      });
    }

    console.log(`Reddit final count: ${items.length} posts for keyword: ${keyword}`);
    return items;

  } catch (error: any) {
    console.warn(`Reddit fetch error for ${keyword}:`, error.message || error);
    return items;
  }
}

// Google News Agent - SerpAPI
export async function fetchNewsPosts(keyword: string): Promise<Post[]> {
  const items: Post[] = [];
  
  try {
    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      console.warn('News: SERPAPI_KEY not configured');
      return items;
    }

    const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}`;

    const response = await fetch(url);

    if (response.status !== 200) {
      console.warn(`News: API returned ${response.status}`);
      return items;
    }

    const data = await response.json() as any;
    const newsResults = data.news_results || [];

    for (let i = 0; i < Math.min(newsResults.length, 20); i++) {
      const n = newsResults[i];
      if (!n || typeof n !== 'object') continue;

      const sourceName = n.source?.name || n.source || 'News Source';
      const title = n.title || '';
      const snippet = n.snippet || '';
      const text = snippet ? `${title} — ${snippet}` : title;
      const link = n.link;

      if (!text.trim()) continue;

      // News articles typically don't have engagement metrics in API response
      // But we can use position as a proxy (lower position = more relevant/popular)
      const position = n.position || 999;
      const estimatedEngagement = Math.max(1, (11 - position) * 500); // Estimate based on position

      items.push({
        id: `news_${n.position || ''}_${(n.title || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) & 0xffff}`,
        platform: 'news',
        author: sourceName,
        handle: sourceName,
        timestamp: formatTimestamp(new Date()),
        content: text,
        riskScore: getMockRiskScore(),
        sentiment: getMockSentiment(),
        badges: [],
        reach: 80000, // Default for news sources
        engagement: estimatedEngagement, // Estimated based on search position
        entity: keyword,
        url: link,
      });
    }

    console.log(`News final count: ${items.length} articles for keyword: ${keyword}`);
    return items;

  } catch (error: any) {
    console.warn(`News fetch error for ${keyword}:`, error.message || error);
    return items;
  }
}

// Facebook Agent - RapidAPI facebook-scraper3
export async function fetchFacebookPosts(keyword: string): Promise<Post[]> {
  const items: Post[] = [];
  
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const fbSearchUrl = process.env.RAPIDAPI_FB_SEARCH_URL || 'https://facebook-scraper3.p.rapidapi.com/search/posts';
    const fbSearchHost = process.env.RAPIDAPI_FB_SEARCH_HOST || 'facebook-scraper3.p.rapidapi.com';

    if (!rapidApiKey || !fbSearchUrl || !fbSearchHost) {
      console.warn('Facebook: Config missing -', {
        hasKey: !!rapidApiKey,
        url: fbSearchUrl,
        host: fbSearchHost,
      });
      return items;
    }

    const headers = {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': fbSearchHost,
    };

    const params = new URLSearchParams({
      query: keyword,
      limit: '10',
    });

    const url = `${fbSearchUrl}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (response.status !== 200) {
      const errorText = (await response.text().catch(() => '')).substring(0, 200);
      console.warn(`Facebook HTTP ${response.status} for ${keyword}: ${errorText}`);
      return items;
    }

    const payload = await response.json() as any;
    
    // Get posts from response - following Python implementation
    const posts = payload.results || payload.result || payload.data || [];

    console.log(`Facebook API returned ${posts.length} raw posts for keyword: ${keyword}`);

    if (!Array.isArray(posts) || posts.length === 0) {
      console.warn(`Facebook empty results for ${keyword}. Keys:`, Object.keys(payload as object));
      return items;
    }

    // Process posts
    for (let i = 0; i < Math.min(posts.length, 20); i++) {
      const p = posts[i];
      if (!p || typeof p !== 'object') continue;

      const postId = p.post_id || p.id || String(i);
      
      // Extract author - try multiple paths
      let author: string = 'Unknown';
      const authorObj = p.from || p.author || p.user;
      if (typeof authorObj === 'object' && authorObj !== null) {
        author = authorObj.name || authorObj.username || authorObj.id || 'Unknown';
      } else if (typeof authorObj === 'string') {
        author = authorObj;
      }

      const text = (p.message || p.text || p.story || '').trim();
      if (!text) {
        console.warn(`Facebook post ${i} skipped - empty text`);
        continue;
      }

      const url = p.permalink_url || p.url || undefined;

      // Handle timestamp
      let timestamp: Date | null = null;
      const ts = p.created_time || p.created_at || p.timestamp;
      if (typeof ts === 'number') {
        timestamp = new Date(ts * 1000);
      } else if (typeof ts === 'string') {
        try {
          timestamp = new Date(ts.replace('Z', '+00:00'));
        } catch {
          timestamp = null;
        }
      }

      // Extract Facebook engagement metrics
      const likes = (typeof p.likes === 'object' && p.likes !== null) 
        ? (p.likes.summary?.total_count || p.likes.count || 0)
        : (typeof p.likes === 'number' ? p.likes : 0);
      const reactions = (typeof p.reactions === 'object' && p.reactions !== null)
        ? (p.reactions.summary?.total_count || p.reactions.count || 0)
        : (typeof p.reactions === 'number' ? p.reactions : 0);
      const shares = (typeof p.shares === 'object' && p.shares !== null)
        ? (p.shares.count || p.shares.summary?.total_count || 0)
        : (typeof p.shares === 'number' ? p.shares : 0);
      const comments = (typeof p.comments === 'object' && p.comments !== null)
        ? (p.comments.summary?.total_count || p.comments.count || 0)
        : (typeof p.comments === 'number' ? p.comments : 0);
      
      const totalEngagement = reactions || likes || 0;
      const totalInteractions = totalEngagement + shares + comments;

      // Extract hashtags from text (Facebook uses #hashtag format)
      const hashtagRegex = /#[\w]+/g;
      const hashtagMatches = text.match(hashtagRegex) || [];
      const hashtags: string[] = hashtagMatches
        .map((tag: string) => tag.substring(1)) // Remove # symbol
        .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index); // Remove duplicates

      // Extract media/images from Facebook post
      const media: MediaItem[] = [];
      // Facebook media can be in attachments or full_picture
      if (p.attachments && Array.isArray(p.attachments)) {
        for (const att of p.attachments) {
          if (att.media?.image?.src) {
            media.push({
              url: att.media.image.src,
              type: 'image',
              thumbnail_url: att.media.image.src,
            });
          } else if (att.media?.source) {
            media.push({
              url: att.media.source,
              type: 'video',
              thumbnail_url: att.media.preview?.src || att.media.source,
            });
          } else if (att.target?.url) {
            // Try to determine if it's an image from URL
            const attUrl = att.target.url;
            if (attUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              media.push({
                url: attUrl,
                type: 'image',
                thumbnail_url: attUrl,
              });
            }
          }
        }
      }
      // Also check full_picture (Facebook often provides a preview image)
      if (p.full_picture && !media.some(m => m.url === p.full_picture)) {
        media.push({
          url: p.full_picture,
          type: 'image',
          thumbnail_url: p.full_picture,
        });
      }

      items.push({
        id: `fb_${postId}`,
        platform: 'facebook',
        author: author,
        handle: author,
        timestamp: timestamp ? formatTimestamp(timestamp) : formatTimestamp(new Date()),
        content: text,
        riskScore: getMockRiskScore(),
        sentiment: getMockSentiment(),
        badges: [],
        reach: 60000, // Default (Facebook API doesn't always provide reach)
        engagement: totalInteractions > 0 ? totalInteractions : (totalEngagement || 1500), // Reactions/likes + shares + comments
        entity: keyword,
        url: url,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        media: media.length > 0 ? media : undefined,
      });

      if (items.length >= 10) break;
    }

    console.log(`Facebook final count: ${items.length} posts for keyword: ${keyword}`);
    return items;

  } catch (error: any) {
    console.warn(`Facebook fetch error for ${keyword}:`, error.message || error);
    return items;
  }
}

// Main search function that runs all agents in parallel
export async function searchAllSources(keyword: string): Promise<{ posts: Post[]; errors: string[] }> {
  const errors: string[] = [];

  // Execute all agents in parallel
  const [twitterPosts, redditPosts, newsPosts, facebookPosts] = await Promise.allSettled([
    fetchTwitterPosts(keyword),
    fetchRedditPosts(keyword),
    fetchNewsPosts(keyword),
    fetchFacebookPosts(keyword),
  ]);

  // Extract results and track errors
  const posts: Post[] = [];

  if (twitterPosts.status === 'fulfilled') {
    posts.push(...twitterPosts.value);
  } else {
    const errorMsg = twitterPosts.reason?.message || 'Failed to fetch';
    console.warn(`Twitter fetch failed: ${errorMsg}`);
    errors.push(`Twitter: ${errorMsg}`);
  }

  if (redditPosts.status === 'fulfilled') {
    posts.push(...redditPosts.value);
  } else {
    const errorMsg = redditPosts.reason?.message || 'Failed to fetch';
    console.warn(`Reddit fetch failed: ${errorMsg}`);
    errors.push(`Reddit: ${errorMsg}`);
  }

  if (newsPosts.status === 'fulfilled') {
    posts.push(...newsPosts.value);
  } else {
    const errorMsg = newsPosts.reason?.message || 'Failed to fetch';
    console.warn(`News fetch failed: ${errorMsg}`);
    errors.push(`News: ${errorMsg}`);
  }

  if (facebookPosts.status === 'fulfilled') {
    posts.push(...facebookPosts.value);
  } else {
    const errorMsg = facebookPosts.reason?.message || 'Failed to fetch';
    console.warn(`Facebook fetch failed: ${errorMsg}`);
    errors.push(`Facebook: ${errorMsg}`);
  }

  // Sort by timestamp (newest first) - using a simple sort based on ID timestamp
  posts.sort((a, b) => {
    const aTime = parseInt(a.id.split('-')[1]) || 0;
    const bTime = parseInt(b.id.split('-')[1]) || 0;
    return bTime - aTime;
  });

  return { posts, errors };
}


