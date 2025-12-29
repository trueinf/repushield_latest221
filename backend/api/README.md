# Vercel Serverless Functions

This directory contains the Vercel serverless function entry point.

The `index.ts` file wraps the Express application to work with Vercel's serverless function runtime.

## How it works

Vercel automatically detects and deploys the function based on `vercel.json` configuration. All routes are handled by the Express app wrapper.

## Environment Variables

Make sure to set these in Vercel Dashboard → Project Settings → Environment Variables:

- `RAPIDAPI_KEY`
- `SERPAPI_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Deployment

The function is automatically deployed when you push to GitHub and the Vercel project is connected.

