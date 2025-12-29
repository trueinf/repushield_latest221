# Deployment Guide - Repushield Web Application

This guide explains how to deploy the Repushield application with:
- **Backend**: Hosted on Vercel (Node.js/Express API)
- **Frontend**: Hosted on Netlify (React/Vite)

## Prerequisites

1. GitHub account
2. Vercel account (sign up at [vercel.com](https://vercel.com))
3. Netlify account (sign up at [netlify.com](https://netlify.com))
4. Supabase project (for database)
5. API keys:
   - RapidAPI Key (for social media APIs)
   - SerpAPI Key (for Google AI Mode)
   - OpenAI API Key (for LLM features)

## Step 1: Push Project to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
# In the project root directory
git init
git add .
git commit -m "Initial commit: Repushield Web Application"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `repushield-web-app` (or your preferred name)
3. **DO NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

### 1.3 Push to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/repushield-web-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Vercel

### 2.1 Prepare Backend for Vercel

The backend is already configured with `vercel.json` in the `backend/` directory.

### 2.2 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select the repository: `repushield-web-app`

### 2.3 Configure Vercel Project

**Project Settings:**
- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Output Directory**: (leave empty - not used for serverless)
- **Install Command**: `npm install`

### 2.4 Set Environment Variables in Vercel

Go to **Project Settings → Environment Variables** and add:

```
RAPIDAPI_KEY=your_rapidapi_key_here
SERPAPI_KEY=your_serpapi_key_here
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
NODE_ENV=production
```

**Important**: Set these for **Production**, **Preview**, and **Development** environments.

### 2.5 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy the deployment URL (e.g., `https://repushield-backend.vercel.app`)

**Note**: The API will be available at:
- `https://YOUR_PROJECT.vercel.app/api/*`

## Step 3: Deploy Frontend to Netlify

### 3.1 Prepare Frontend for Netlify

The frontend is already configured with `netlify.toml` in the `frontend/` directory.

### 3.2 Connect GitHub to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub
5. Select repository: `repushield-web-app`

### 3.3 Configure Netlify Build Settings

**Build Settings:**
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: `20` (or your preferred version)

### 3.4 Set Environment Variables in Netlify

Go to **Site Settings → Environment Variables** and add:

```
VITE_API_URL=https://YOUR_VERCEL_BACKEND_URL.vercel.app
```

**Replace `YOUR_VERCEL_BACKEND_URL` with your actual Vercel backend URL from Step 2.5**

### 3.5 Deploy

1. Click **"Deploy site"**
2. Wait for deployment to complete
3. Your site will be available at: `https://random-name-123.netlify.app`

### 3.6 Configure Custom Domain (Optional)

1. Go to **Domain Settings**
2. Click **"Add custom domain"**
3. Follow Netlify's instructions to configure DNS

## Step 4: Update API URLs

After deployment, update the frontend environment variable:

1. Go to **Netlify Dashboard → Site Settings → Environment Variables**
2. Update `VITE_API_URL` to your Vercel backend URL:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```
3. Trigger a new deployment: **Deploys → Trigger deploy → Deploy site**

## Step 5: Test Deployment

### Test Backend (Vercel)

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Should return: {"status":"ok","message":"API server is running"}
```

### Test Frontend (Netlify)

1. Open your Netlify site URL
2. Try searching for a keyword
3. Verify API calls are working in browser DevTools → Network tab

## Troubleshooting

### Backend Issues (Vercel)

**Problem**: Functions timeout
- **Solution**: Increase timeout in `vercel.json`:
  ```json
  "functions": {
    "api/index.ts": {
      "maxDuration": 300
    }
  }
  ```

**Problem**: Environment variables not loading
- **Solution**: 
  - Ensure all variables are set in Vercel dashboard
  - Redeploy after adding variables
  - Check variable names match exactly (case-sensitive)

**Problem**: CORS errors
- **Solution**: Verify `cors()` middleware is enabled in `api/index.ts`
- Add your Netlify domain to allowed origins if needed

### Frontend Issues (Netlify)

**Problem**: API calls failing
- **Solution**: 
  - Verify `VITE_API_URL` is set correctly in Netlify environment variables
  - Check browser console for actual API URL being used
  - Ensure Vercel backend is accessible

**Problem**: 404 errors on page refresh
- **Solution**: The `netlify.toml` should already have SPA redirect rules. Verify they're deployed.

**Problem**: Build fails
- **Solution**:
  - Check Node version (should be 20)
  - Verify all dependencies are in `package.json`
  - Check build logs in Netlify dashboard

## Environment Variables Summary

### Vercel (Backend)
```
RAPIDAPI_KEY
SERPAPI_KEY
OPENAI_API_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
PORT
NODE_ENV
```

### Netlify (Frontend)
```
VITE_API_URL
```

## Post-Deployment Checklist

- [ ] Backend deployed on Vercel
- [ ] Frontend deployed on Netlify
- [ ] All environment variables set
- [ ] API health check returns success
- [ ] Frontend can connect to backend
- [ ] Search functionality works
- [ ] Database connection working
- [ ] CORS configured correctly

## Continuous Deployment

Both Vercel and Netlify automatically deploy when you push to GitHub:

- **Vercel**: Deploys on push to `main` branch (backend)
- **Netlify**: Deploys on push to `main` branch (frontend)

To deploy:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## Support

For issues:
1. Check deployment logs in Vercel/Netlify dashboards
2. Verify environment variables are set correctly
3. Test API endpoints directly using curl or Postman
4. Check browser console for frontend errors

