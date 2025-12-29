// API utility for making requests to the backend

export interface SearchResponse {
  success: boolean;
  posts: Post[];
  errors?: string[];
}

export interface Post {
  id: string;
  platform: 'twitter' | 'reddit' | 'facebook' | 'news' | 'youtube' | 'instagram' | 'quora';
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
  hashtags?: string[];
  media?: MediaItem[];
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'gif';
  thumbnail_url?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function searchPosts(keyword: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
}

export async function getAdminResponse(postId: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin-response/${postId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No response available
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.response : null;
  } catch (error) {
    console.error('Error fetching admin response:', error);
    return null;
  }
}

export async function translateText(text: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.translatedText : null;
  } catch (error) {
    console.error('Error translating text:', error);
    return null;
  }
}

export interface EvidenceItem {
  id?: number;
  post_id: string;
  source: string;
  title?: string | null;
  url?: string | null;
  snippet?: string | null;
  evidence_data?: any;
  created_at?: string;
}

export interface FactCheckClaim {
  id: string;
  text: string;
  verdict: 'true' | 'false' | 'misleading' | 'unverified';
  confidence: 'high' | 'medium' | 'low';
  correctData?: string;
  sources: string[];
  explanation: string;
}

export interface FactCheckResult {
  success: boolean;
  claims: FactCheckClaim[];
  hasEvidence: boolean;
}

export async function getEvidence(postId: string): Promise<EvidenceItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/evidence/${postId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.evidence : [];
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return [];
  }
}

export async function factCheckPost(postId: string, postContent: string): Promise<FactCheckResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/factcheck/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postContent }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Error fact-checking post:', error);
    return null;
  }
}


