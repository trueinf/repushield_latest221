# Pre-Deployment Checklist

Use this checklist before deploying to ensure everything is configured correctly.

## 📋 Repository Setup

- [ ] Git repository initialized
- [ ] `.gitignore` file present and configured
- [ ] All sensitive files excluded (`.env.local`, `node_modules`, etc.)
- [ ] Project pushed to GitHub

## 🔑 API Keys & Services

- [ ] **Supabase Project**
  - [ ] Project created
  - [ ] Database schema executed (`backend/src/database/schema.sql`)
  - [ ] URL and Anon Key copied

- [ ] **RapidAPI Account**
  - [ ] Account created
  - [ ] API key obtained
  - [ ] Twitter, Reddit, Facebook APIs subscribed

- [ ] **SerpAPI Account**
  - [ ] Account created
  - [ ] API key obtained
  - [ ] Google AI Mode access confirmed

- [ ] **OpenAI Account**
  - [ ] Account created
  - [ ] API key obtained
  - [ ] Credits available

## 🏗️ Backend Configuration (Vercel)

- [ ] `backend/vercel.json` exists and is configured
- [ ] `backend/api/index.ts` exists (serverless function)
- [ ] Environment variables prepared:
  - [ ] `RAPIDAPI_KEY`
  - [ ] `SERPAPI_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `PORT` (optional, defaults to 3001)
  - [ ] `NODE_ENV=production`

## 🎨 Frontend Configuration (Netlify)

- [ ] `frontend/netlify.toml` exists and is configured
- [ ] `frontend/package.json` has build script
- [ ] Environment variable prepared:
  - [ ] `VITE_API_URL` (will be set after Vercel deployment)

## 🧪 Local Testing

- [ ] Backend runs locally (`npm run dev` in `backend/`)
- [ ] Frontend runs locally (`npm run dev` in `frontend/`)
- [ ] API endpoints respond correctly
- [ ] Database connection works
- [ ] Search functionality tested
- [ ] Evidence collection works (test with high-risk post)

## 📝 Documentation

- [ ] `DEPLOYMENT.md` reviewed
- [ ] `README.md` updated
- [ ] Environment variable documentation clear

## 🚀 Ready to Deploy

Once all items are checked:
1. Push final code to GitHub
2. Deploy backend to Vercel
3. Deploy frontend to Netlify
4. Update `VITE_API_URL` in Netlify with Vercel backend URL
5. Test deployed application

