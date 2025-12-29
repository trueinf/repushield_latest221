# Quick Start Guide - Deploy to GitHub, Vercel, and Netlify

## 🚀 Quick Deployment Steps

### 1. Push to GitHub (5 minutes)

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/repushield-web-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend to Vercel (10 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign in → **Add New Project**
2. **Import** your GitHub repository
3. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: **`backend`** (important!)
   - Build Command: `npm install`
   - Output Directory: (leave empty)
   - Install Command: `npm install`
4. **Add Environment Variables**:
   ```
   RAPIDAPI_KEY=your_key
   SERPAPI_KEY=your_key
   OPENAI_API_KEY=your_key
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   PORT=3001
   NODE_ENV=production
   ```
5. Click **Deploy** → Wait → Copy your backend URL

### 3. Deploy Frontend to Netlify (10 minutes)

1. Go to [netlify.com](https://netlify.com) → Sign in → **Add new site** → **Import an existing project**
2. Choose **Deploy with GitHub**
3. Select your repository
4. **Configure Build Settings**:
   - Base directory: **`frontend`**
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://your-vercel-backend.vercel.app` (from step 2)
6. Click **Deploy site**

### 4. Test It! 🎉

1. Open your Netlify site URL
2. Try searching for a keyword
3. Check if it works!

## 🔧 Troubleshooting

**Backend not working?**
- Check Vercel logs: Dashboard → Deployments → Click latest → View Function Logs
- Verify all environment variables are set correctly

**Frontend can't connect?**
- Verify `VITE_API_URL` in Netlify matches your Vercel backend URL
- Check browser console (F12) for errors
- Make sure backend URL doesn't have trailing slash

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

