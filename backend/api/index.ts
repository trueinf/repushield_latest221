// Vercel serverless function entry point
// This wraps the Express app for Vercel deployment

import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables (for local development)
// Vercel automatically provides env vars in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

// Import route handlers
import { processAndStorePosts } from '../src/processing.js';
import { getAdminResponse, getEvidence, getPostById } from '../src/database/operations.js';
import { getDashboardData, clearAllData } from '../src/database/operations.js';
import { translateToEnglish } from '../src/agents/translate.js';
import { factCheckPost } from '../src/agents/factcheck.js';

const app: Express = express();

// CORS configuration - allow all origins for now, can restrict later
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://repushild.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173',
      /^https:\/\/.*\.netlify\.app$/,
    ];
    
    if (allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }

    const searchKeyword = keyword.trim();
    const { posts, errors } = await processAndStorePosts(searchKeyword);

    const response = {
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
});

// Get admin response for a post
app.get('/api/admin-response/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const response = await getAdminResponse(postId);
    
    if (response) {
      return res.status(200).json({ success: true, response });
    } else {
      return res.status(404).json({ success: false, error: 'Response not found' });
    }
  } catch (error: any) {
    console.error('Get admin response error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Get dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const timeRange = (req.query.timeRange as string) || '7d';
    const data = await getDashboardData(timeRange);
    
    if (data) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(200).json({ success: true, data: null });
    }
  } catch (error: any) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Clear all data from database
app.delete('/api/clear', async (req, res) => {
  try {
    const success = await clearAllData();
    
    if (success) {
      return res.status(200).json({ success: true, message: 'All data cleared successfully' });
    } else {
      return res.status(500).json({ success: false, error: 'Failed to clear data' });
    }
  } catch (error: any) {
    console.error('Clear data error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Translate post to English
app.post('/api/translate', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const translatedText = await translateToEnglish(text.trim());
    
    if (translatedText) {
      return res.status(200).json({ success: true, translatedText });
    } else {
      return res.status(500).json({ success: false, error: 'Translation failed' });
    }
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Get evidence for a post
app.get('/api/evidence/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const evidence = await getEvidence(postId);
    
    return res.status(200).json({ success: true, evidence });
  } catch (error: any) {
    console.error('Get evidence error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Fact-check a post
app.post('/api/factcheck/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { postContent } = req.body;

    if (!postContent || typeof postContent !== 'string' || postContent.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Post content is required' });
    }

    const result = await factCheckPost(postId, postContent.trim());
    
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error('Fact-check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Vercel serverless function handler
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

