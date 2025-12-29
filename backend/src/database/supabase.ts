// Supabase client setup
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables if not already loaded
// This ensures env vars are available even if this module is imported before dotenv.config() runs
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  // Try multiple paths: relative to backend directory, relative to current module, and cwd
  const backendDir = path.resolve(__dirname, '../..');
  const envPaths = [
    path.resolve(backendDir, '.env.local'),
    path.resolve(process.cwd(), 'backend', '.env.local'),
    path.resolve(process.cwd(), '.env.local'),
  ];
  
  let loaded = false;
  for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath });
    if (!result.error && (process.env.SUPABASE_URL || process.env.SUPABASE_ANON_KEY)) {
      loaded = true;
      break;
    }
  }
}

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠ Supabase credentials not configured. Database operations will be skipped.');
  console.warn('   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in backend/.env.local');
  console.warn(`   SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'} (${supabaseUrl ? 'set' : 'empty'})`);
  console.warn(`   SUPABASE_ANON_KEY: ${supabaseKey ? '✓' : '✗'} (${supabaseKey ? 'set' : 'empty'})`);
} else {
  console.log('✓ Supabase client initialized successfully');
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database operation types
export interface PostRow {
  id: string;
  platform: 'twitter' | 'reddit' | 'facebook' | 'news';
  entity: string;
  rest_id?: string | null;
  id_str?: string | null;
  conversation_id_str?: string | null;
  full_text: string;
  lang?: string | null;
  display_text_range?: string | null;
  source?: string | null;
  created_at: string;
  favorite_count?: number | null;
  retweet_count?: number | null;
  reply_count?: number | null;
  quote_count?: number | null;
  view_count?: number | null;
  in_reply_to_status_id_str?: string | null;
  in_reply_to_user_id_str?: string | null;
  in_reply_to_screen_name?: string | null;
  is_quote_status?: boolean | null;
  user_rest_id?: string | null;
  user_name?: string | null;
  user_screen_name?: string | null;
  user_avatar_url?: string | null;
  user_bio?: string | null;
  user_banner_url?: string | null;
  user_location?: string | null;
  user_followers_count?: number | null;
  user_friends_count?: number | null;
  user_statuses_count?: number | null;
  user_media_count?: number | null;
  user_favourites_count?: number | null;
  user_verified?: boolean | null;
  user_is_blue_verified?: boolean | null;
  user_protected?: boolean | null;
  user_account_created_at?: string | null;
  platform_data?: any;
  score?: number | null;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  reach?: number | null;
  engagement?: number | null;
  url?: string | null;
}

export interface EntityRow {
  post_id: string;
  entity_type: 'user_mention' | 'hashtag' | 'url' | 'symbol' | 'timestamp';
  text?: string | null;
  indices?: string | null;
  url?: string | null;
  expanded_url?: string | null;
  display_url?: string | null;
}

export interface MediaRow {
  post_id: string;
  media_url_https?: string | null;
  media_type?: 'photo' | 'video' | 'gif' | 'animated_gif' | null;
  width?: number | null;
  height?: number | null;
  video_variants?: any;
}

export interface EvidenceRow {
  post_id: string;
  source: string;
  title?: string | null;
  url?: string | null;
  snippet?: string | null;
  evidence_data?: any;
}

export interface AdminResponseRow {
  post_id: string;
  response_text: string;
  generated_by?: string | null;
  model_used?: string | null;
}



