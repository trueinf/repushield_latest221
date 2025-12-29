# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the database to be provisioned

## 2. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `backend/src/database/schema.sql`
4. Paste and run it in the SQL Editor

This will create all necessary tables:
- `posts` - Main posts table with all metadata
- `entities` - Text metadata (mentions, hashtags, URLs)
- `media` - Media attachments
- `evidence` - Evidence collected for high-risk posts
- `admin_responses` - Generated admin responses

## 3. Get API Keys

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

## 4. Update Environment Variables

Add to your `backend/.env.local` file:

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## 5. Verify Setup

The backend will automatically use Supabase when these environment variables are set. You can verify by:

1. Running a search in the Feed page
2. Checking Supabase Dashboard → Table Editor → `posts` table
3. You should see posts being stored after searches

## Notes

- Posts are stored automatically after fetching and scoring
- Admin responses are generated for posts with score >= 8 (high-risk on 1-10 scale)
- Dashboard data is fetched from Supabase
- All operations are non-blocking (errors won't stop the app)

