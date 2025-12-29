import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processAndStorePosts } from '../src/processing';

interface ApiResponse {
  success: boolean;
  posts: any[];
  errors?: string[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { keyword } = req.body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }

    const searchKeyword = keyword.trim();
    // Use new processing workflow: Fetch → Score → Store → Evidence/Response
    const { posts, errors } = await processAndStorePosts(searchKeyword);

    const response: ApiResponse = {
      success: true,
      posts,
      ...(errors.length > 0 && { errors }),
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Search handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}


