// Local development server for API endpoints
// This runs separately from the frontend dev server

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import express from 'express';
import cors from 'cors';
import { processAndStorePosts } from '../src/processing';
import { getAdminResponse, getEvidence, getPostById } from '../src/database/operations';
import { getDashboardData, clearAllData } from '../src/database/operations';
import { translateToEnglish } from '../src/agents/translate';
import { factCheckPost } from '../src/agents/factcheck';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
    // Use new processing workflow: Fetch → Score → Store → Evidence/Response
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

// Fact-check a post (extract claims and analyze against evidence)
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

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/search`);
  console.log(`🔑 Environment variables loaded:`);
  console.log(`   RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   SERPAPI_KEY: ${process.env.SERPAPI_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ Set' : '✗ Not set'}`);
  console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}`);
});

