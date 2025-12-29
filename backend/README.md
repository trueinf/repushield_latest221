# Repushield Backend

Backend API server for the Repushield Web Application.

## Structure

- `src/services.ts` - Core business logic for fetching posts from APIs
- `server/index.ts` - Express server for local development
- `api/search.ts` - Serverless function for Vercel deployment

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the backend directory:

```env
# API Keys
RAPIDAPI_KEY=your_rapidapi_key_here
SERPAPI_KEY=your_serpapi_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Facebook API (optional)
RAPIDAPI_FB_SEARCH_URL=https://facebook-scraper3.p.rapidapi.com/search/posts
RAPIDAPI_FB_SEARCH_HOST=facebook-scraper3.p.rapidapi.com

# Supabase (for database storage)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed Supabase setup instructions.

### 3. Run Development Server

```bash
npm run dev
```

This starts the server on `http://localhost:3001`

## Features

- **Multi-platform search**: Fetches posts from Twitter, Reddit, Google News, and Facebook in parallel
- **Intelligent scoring**: Scores posts from 1-10 (1=positive, 10=negative)
- **Evidence collection**: Automatically collects evidence for high-risk posts (score >= 8) using Google AI Mode
- **Admin responses**: Generates professional admin-style responses using OpenAI
- **Database storage**: Stores all posts, metadata, scores, evidence, and responses in Supabase
- **Real-time dashboard**: Dashboard displays real data from Supabase

## API Endpoints

### POST `/api/search`

Searches for posts across multiple platforms in parallel, scores them, stores in database, and generates responses for high-risk posts.

**Request Body:**
```json
{
  "keyword": "search term"
}
```

**Response:**
```json
{
  "success": true,
  "posts": [...],
  "errors": ["optional error messages"]
}
```

### GET `/api/admin-response/:postId`

Gets the generated admin response for a specific post.

**Response:**
```json
{
  "success": true,
  "response": "Admin response text..."
}
```

### GET `/api/dashboard?timeRange=7d`

Gets aggregated dashboard data from Supabase.

**Query Parameters:**
- `timeRange`: `24h`, `7d`, or `30d` (default: `7d`)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMentions": 1234,
    "platformData": [...],
    "riskData": { "high": 12, "medium": 34, "low": 87 },
    "mentionsOverTime": [...]
  }
}
```

**Request Body:**
```json
{
  "keyword": "search term"
}
```

**Response:**
```json
{
  "success": true,
  "posts": [...],
  "errors": ["optional error messages"]
}
```

## Deployment

### Vercel

The `api/` folder contains serverless functions for Vercel deployment.

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard


