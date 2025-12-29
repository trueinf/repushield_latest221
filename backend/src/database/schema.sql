-- Supabase Database Schema for Repushield
-- Run this in your Supabase SQL editor

-- Posts table (main table for all platforms)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'reddit', 'facebook', 'news')),
  entity TEXT NOT NULL, -- keyword searched
  
  -- Tweet/Post level identifiers
  rest_id TEXT, -- Twitter tweet ID or equivalent
  id_str TEXT,
  conversation_id_str TEXT,
  
  -- Content
  full_text TEXT NOT NULL,
  lang TEXT,
  display_text_range TEXT, -- JSON array [start, end]
  source TEXT,
  
  -- Time
  created_at TIMESTAMPTZ NOT NULL,
  
  -- Engagement metrics
  favorite_count INTEGER DEFAULT 0,
  retweet_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  quote_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Reply/thread info
  in_reply_to_status_id_str TEXT,
  in_reply_to_user_id_str TEXT,
  in_reply_to_screen_name TEXT,
  is_quote_status BOOLEAN DEFAULT FALSE,
  
  -- User/Author information
  user_rest_id TEXT,
  user_name TEXT, -- Display name
  user_screen_name TEXT, -- @handle
  user_avatar_url TEXT,
  user_bio TEXT,
  user_banner_url TEXT,
  user_location TEXT,
  user_followers_count INTEGER DEFAULT 0,
  user_friends_count INTEGER DEFAULT 0,
  user_statuses_count INTEGER DEFAULT 0,
  user_media_count INTEGER DEFAULT 0,
  user_favourites_count INTEGER DEFAULT 0,
  user_verified BOOLEAN DEFAULT FALSE,
  user_is_blue_verified BOOLEAN DEFAULT FALSE,
  user_protected BOOLEAN DEFAULT FALSE,
  user_account_created_at TIMESTAMPTZ,
  
  -- Platform-specific fields (flexible JSON)
  platform_data JSONB, -- Store raw API response for platform-specific fields
  
  -- Scoring and analysis
  score INTEGER, -- 1-10 (1=positive, 10=negative)
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  
  -- Engagement and reach
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  
  -- URLs
  url TEXT,
  
  -- Timestamps
  created_at_db TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entities table (mentions, hashtags, URLs, etc.)
CREATE TABLE IF NOT EXISTS entities (
  id SERIAL PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user_mention', 'hashtag', 'url', 'symbol', 'timestamp')),
  text TEXT,
  indices TEXT, -- JSON array [start, end]
  url TEXT, -- For URL entities
  expanded_url TEXT,
  display_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media table (images, videos)
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_url_https TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'video', 'gif', 'animated_gif')),
  width INTEGER,
  height INTEGER,
  video_variants JSONB, -- Array of video variants
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence table (for posts with score >= 8 - high-risk)
CREATE TABLE IF NOT EXISTS evidence (
  id SERIAL PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'serpapi_google_ai'
  title TEXT,
  url TEXT,
  snippet TEXT,
  evidence_data JSONB, -- Full evidence response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin responses table
CREATE TABLE IF NOT EXISTS admin_responses (
  id SERIAL PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  generated_by TEXT DEFAULT 'openai',
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_entity ON posts(entity);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(score);
CREATE INDEX IF NOT EXISTS idx_posts_platform_score ON posts(platform, score);
CREATE INDEX IF NOT EXISTS idx_entities_post_id ON entities(post_id);
CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
CREATE INDEX IF NOT EXISTS idx_evidence_post_id ON evidence(post_id);
CREATE INDEX IF NOT EXISTS idx_admin_responses_post_id ON admin_responses(post_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

