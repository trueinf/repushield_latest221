# Vercel Deployment Configuration

## Current Setup

- **Root Directory**: `backend` (configure in Vercel project settings)
- **Build Command**: None (Vercel auto-compiles TypeScript)
- **Output Directory**: Not needed (serverless functions only)
- **Install Command**: `npm install` (default)

## Configuration Files

### vercel.json
- Routes all requests to `/api/index.ts`
- Configures serverless function with 300s timeout and 1024MB memory
- Uses `@vercel/node` runtime

### package.json
- Includes `@types/cors` in devDependencies
- TypeScript configured with relaxed strict mode for dynamic types

## TypeScript Fixes Applied

1. ✅ Added `@types/cors` package
2. ✅ Fixed type assertions in `evidence.ts`
3. ✅ Fixed EvidenceRow.id access in `factcheck.ts`
4. ✅ Fixed PostRow/EntityRow/MediaRow imports in `processing.ts`
5. ✅ Exported types from `operations.ts`
6. ✅ Updated `tsconfig.json` with relaxed strict mode

## Deployment Steps

1. **Trigger New Deployment**: Make sure Vercel uses the latest commit (51f1e35 or later)
   - In Vercel dashboard, click "Redeploy" → "Use existing Build Cache" → **UNCHECK** this option
   - Or push a new commit to trigger automatic deployment

2. **Verify Environment Variables**: Ensure all are set in Vercel:
   - `RAPIDAPI_KEY`
   - `SERPAPI_KEY`
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

3. **Project Settings in Vercel**:
   - Framework Preset: **Other**
   - Root Directory: **`backend`** (IMPORTANT!)
   - Build Command: (leave empty or remove)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

## Troubleshooting

If you see "No Output Directory" error:
- This is normal for serverless-only projects
- Ensure "Output Directory" is empty in Vercel project settings
- The error might appear but deployment should still work

If TypeScript errors persist:
- Check that commit 51f1e35 or later is deployed
- Verify `@types/cors` is in package.json devDependencies
- Check that all type fixes are in the deployed code

