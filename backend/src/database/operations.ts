// Database operations for storing posts, entities, media, evidence, and responses
import { supabase, type PostRow, type EntityRow, type MediaRow, type EvidenceRow, type AdminResponseRow } from './supabase';

// Store a post in the database
export async function storePost(postData: PostRow): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping database storage');
    return false;
  }

  try {
    const { error } = await supabase
      .from('posts')
      .upsert(postData, { onConflict: 'id' });

    if (error) {
      console.error(`Error storing post ${postData.id}:`, error);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error(`Exception storing post ${postData.id}:`, error.message);
    return false;
  }
}

// Store entities for a post
export async function storeEntities(postId: string, entities: EntityRow[]): Promise<boolean> {
  if (!supabase || entities.length === 0) return true;

  try {
    const entitiesWithPostId = entities.map(e => ({ ...e, post_id: postId }));
    const { error } = await supabase
      .from('entities')
      .insert(entitiesWithPostId);

    if (error) {
      console.error(`Error storing entities for post ${postId}:`, error);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error(`Exception storing entities for post ${postId}:`, error.message);
    return false;
  }
}

// Store media for a post
export async function storeMedia(postId: string, media: MediaRow[]): Promise<boolean> {
  if (!supabase || media.length === 0) return true;

  try {
    const mediaWithPostId = media.map(m => ({ ...m, post_id: postId }));
    const { error } = await supabase
      .from('media')
      .insert(mediaWithPostId);

    if (error) {
      console.error(`Error storing media for post ${postId}:`, error);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error(`Exception storing media for post ${postId}:`, error.message);
    return false;
  }
}

// Store evidence for a post
export async function storeEvidence(evidence: EvidenceRow): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('evidence')
      .insert(evidence);

    if (error) {
      console.error(`Error storing evidence for post ${evidence.post_id}:`, error);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error(`Exception storing evidence for post ${evidence.post_id}:`, error.message);
    return false;
  }
}

// Store admin response for a post
export async function storeAdminResponse(response: AdminResponseRow): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('admin_responses')
      .insert(response);

    if (error) {
      console.error(`Error storing admin response for post ${response.post_id}:`, error);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error(`Exception storing admin response for post ${response.post_id}:`, error.message);
    return false;
  }
}

// Get admin response for a post
export async function getAdminResponse(postId: string): Promise<string | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_responses')
      .select('response_text')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }
    return data.response_text;
  } catch (error: any) {
    console.error(`Exception getting admin response for post ${postId}:`, error.message);
    return null;
  }
}

// Get evidence for a post
export async function getEvidence(postId: string): Promise<EvidenceRow[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching evidence for post ${postId}:`, error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error(`Exception getting evidence for post ${postId}:`, error.message);
    return [];
  }
}

// Get post by ID with full details
export async function getPostById(postId: string): Promise<any | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !data) {
      return null;
    }
    return data;
  } catch (error: any) {
    console.error(`Exception getting post ${postId}:`, error.message);
    return null;
  }
}

// Get posts for dashboard (aggregated data)
export async function getDashboardData(timeRange: string = '7d') {
  if (!supabase) return null;

  try {
    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get posts in date range
    const { data: posts, error } = await supabase
      .from('posts')
      .select('platform, score, sentiment, engagement, reach, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }

    if (!posts || posts.length === 0) {
      return {
        totalMentions: 0,
        platformData: [],
        riskData: { high: 0, medium: 0, low: 0 },
        mentionsOverTime: [],
        averageScore: 5, // Default to neutral
        topTopics: [], // Empty top topics
      };
    }

    // Calculate platform breakdown
    const platformMap: Record<string, { mentions: number; totalScore: number; count: number }> = {};
    posts.forEach((post: any) => {
      const platform = post.platform || 'unknown';
      if (!platformMap[platform]) {
        platformMap[platform] = { mentions: 0, totalScore: 0, count: 0 };
      }
      platformMap[platform].mentions++;
      platformMap[platform].count++;
      if (post.score) {
        platformMap[platform].totalScore += post.score;
      }
    });

    const platformData = Object.entries(platformMap).map(([platform, data]) => ({
      platform,
      mentions: data.mentions,
      score: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
    }));

    // Calculate risk distribution (1-10 scale: 1=positive, 10=negative)
    const highRisk = posts.filter((p: any) => p.score && p.score >= 8).length; // 8-10 = high risk
    const mediumRisk = posts.filter((p: any) => p.score && p.score >= 4 && p.score < 8).length; // 4-7 = medium risk
    const lowRisk = posts.filter((p: any) => !p.score || p.score < 4).length; // 1-3 = low risk

    // Calculate mentions over time (group by day)
    const mentionsByDay: Record<string, number> = {};
    posts.forEach((post: any) => {
      const date = new Date(post.created_at).toISOString().split('T')[0];
      mentionsByDay[date] = (mentionsByDay[date] || 0) + 1;
    });

    const mentionsOverTime = Object.entries(mentionsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mentions: count,
      }));

    // Calculate average score (reputation index)
    const postsWithScores = posts.filter((p: any) => p.score !== null && p.score !== undefined);
    const totalScoreSum = postsWithScores.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
    const averageScore = postsWithScores.length > 0 
      ? Math.round((totalScoreSum / postsWithScores.length) * 10) / 10 // Round to 1 decimal
      : 5; // Default to neutral (5) if no scores

    // Get top 5 hashtags (most repeated)
    let topTopics: Array<{ name: string; volume: number; riskScore: number; sentiment: { positive: number; neutral: number; negative: number } }> = [];
    
    try {
      // Get all hashtags with their post IDs
      const { data: hashtagsData, error: hashtagsError } = await supabase
        .from('entities')
        .select('text, post_id')
        .eq('entity_type', 'hashtag')
        .gte('post_id', '') // Get all hashtags
        .not('text', 'is', null);

      if (!hashtagsError && hashtagsData && hashtagsData.length > 0) {
        // Count hashtag occurrences
        const hashtagCounts: Record<string, { count: number; postIds: string[] }> = {};
        
        hashtagsData.forEach((entity: any) => {
          const hashtag = entity.text?.toLowerCase() || '';
          if (hashtag) {
            if (!hashtagCounts[hashtag]) {
              hashtagCounts[hashtag] = { count: 0, postIds: [] };
            }
            hashtagCounts[hashtag].count++;
            if (entity.post_id && !hashtagCounts[hashtag].postIds.includes(entity.post_id)) {
              hashtagCounts[hashtag].postIds.push(entity.post_id);
            }
          }
        });

        // Get post scores and sentiments for each hashtag
        const topHashtags = Object.entries(hashtagCounts)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 5); // Top 5

        for (const [hashtag, data] of topHashtags) {
          // Get scores and sentiments for posts with this hashtag
          const { data: hashtagPosts } = await supabase
            .from('posts')
            .select('score, sentiment')
            .in('id', data.postIds)
            .gte('created_at', startDate.toISOString());

          if (hashtagPosts && hashtagPosts.length > 0) {
            const scores = hashtagPosts.map((p: any) => p.score).filter((s: any) => s !== null && s !== undefined);
            const averageRiskScore = scores.length > 0
              ? Math.round((scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length) * 10) / 10
              : 5;

            // Count sentiments and calculate percentages
            const totalPosts = hashtagPosts.length;
            const positiveCount = hashtagPosts.filter((p: any) => p.sentiment === 'positive').length;
            const neutralCount = hashtagPosts.filter((p: any) => p.sentiment === 'neutral').length;
            const negativeCount = hashtagPosts.filter((p: any) => p.sentiment === 'negative').length;

            topTopics.push({
              name: `#${hashtag}`,
              volume: data.count,
              riskScore: averageRiskScore,
              sentiment: {
                positive: totalPosts > 0 ? Math.round((positiveCount / totalPosts) * 100) : 0,
                neutral: totalPosts > 0 ? Math.round((neutralCount / totalPosts) * 100) : 0,
                negative: totalPosts > 0 ? Math.round((negativeCount / totalPosts) * 100) : 0,
              },
            });
          } else {
            // If no posts found, still include the hashtag with default values
            topTopics.push({
              name: `#${hashtag}`,
              volume: data.count,
              riskScore: 5,
              sentiment: { positive: 0, neutral: 0, negative: 0 },
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching top hashtags:', error.message);
      // Continue with empty topTopics array
    }

    return {
      totalMentions: posts.length,
      platformData,
      riskData: { high: highRisk, medium: mediumRisk, low: lowRisk },
      mentionsOverTime,
      averageScore,
      topTopics, // Add top hashtags
    };
  } catch (error: any) {
    console.error('Exception fetching dashboard data:', error.message);
    return null;
  }
}

// Clear all data from database (delete all records)
export async function clearAllData(): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot clear data');
    return false;
  }

  try {
    // Delete in order to respect foreign key constraints
    // Delete child tables first, then parent tables
    
    // Delete admin responses (delete all where id exists)
    const { error: adminRespError } = await supabase
      .from('admin_responses')
      .delete()
      .not('id', 'is', null);
    
    if (adminRespError) {
      console.error('Error deleting admin_responses:', adminRespError);
    }

    // Delete evidence (delete all where id exists)
    const { error: evidenceError } = await supabase
      .from('evidence')
      .delete()
      .not('id', 'is', null);
    
    if (evidenceError) {
      console.error('Error deleting evidence:', evidenceError);
    }

    // Delete media (delete all where id exists)
    const { error: mediaError } = await supabase
      .from('media')
      .delete()
      .not('id', 'is', null);
    
    if (mediaError) {
      console.error('Error deleting media:', mediaError);
    }

    // Delete entities (delete all where post_id exists)
    const { error: entitiesError } = await supabase
      .from('entities')
      .delete()
      .not('post_id', 'is', null);
    
    if (entitiesError) {
      console.error('Error deleting entities:', entitiesError);
    }

    // Delete users (delete all where id exists)
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .not('id', 'is', null);
    
    if (usersError) {
      console.error('Error deleting users:', usersError);
    }

    // Delete posts (parent table - should delete last)
    // Delete all posts where id is not null/empty
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .neq('id', '');
    
    if (postsError) {
      console.error('Error deleting posts:', postsError);
      return false;
    }

    console.log('All data cleared successfully');
    return true;
  } catch (error: any) {
    console.error('Exception clearing all data:', error.message);
    return false;
  }
}

