# Repushield Web Application

A comprehensive reputation management platform that monitors social media mentions, analyzes sentiment, collects evidence for high-risk posts, and generates AI-powered responses.

## Features

- **Multi-Platform Monitoring**: Track mentions across Twitter, Reddit, Facebook, News, YouTube, and Instagram
- **AI-Powered Scoring**: LLM-based sentiment analysis (1-10 scale) to identify high-risk posts
- **Evidence Collection**: Automatic evidence gathering from Google AI Mode for high-risk posts (score ≥ 8)
- **Fact-Checking**: Display evidence directly from collected sources
- **Admin Response Generation**: AI-generated professional responses based on evidence
- **Real-Time Dashboard**: Aggregate analytics and insights
- **Translation**: Translate posts to English
- **Data Persistence**: Supabase PostgreSQL database for all posts, evidence, and responses

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- Recharts for data visualization

### Backend
- Node.js
- Express
- TypeScript
- Supabase (PostgreSQL)
- OpenAI (GPT-4o-mini)
- RapidAPI (Social Media APIs)
- SerpAPI (Google AI Mode)

## Project Structure

```
repushield-web-app/
├── backend/              # Backend API server
│   ├── api/             # Vercel serverless functions
│   ├── src/
│   │   ├── agents/      # AI agents (scoring, evidence, factcheck, etc.)
│   │   ├── database/    # Supabase operations
│   │   ├── processing.ts
│   │   └── services.ts  # API integrations
│   ├── server/          # Local development server
│   ├── vercel.json      # Vercel configuration
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Utilities (API client)
│   │   └── ...
│   ├── netlify.toml     # Netlify configuration
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- API Keys:
  - RapidAPI Key
  - SerpAPI Key
  - OpenAI API Key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/repushield-web-app.git
   cd repushield-web-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `backend/.env.local`:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key
   SERPAPI_KEY=your_serpapi_key
   OPENAI_API_KEY=your_openai_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   ```

   Run backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   
   Create `frontend/.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

   Run frontend:
   ```bash
   npm run dev
   ```

4. **Database Setup**
   - Create a Supabase project
   - Run `backend/src/database/schema.sql` in Supabase SQL editor
   - See `backend/SUPABASE_SETUP.md` for detailed instructions

## Deployment

This application is designed to be deployed with:
- **Backend**: Vercel (Serverless Functions)
- **Frontend**: Netlify

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Endpoints

### Backend (Vercel)

- `GET /api/health` - Health check
- `POST /api/search` - Search posts by keyword
- `GET /api/admin-response/:postId` - Get admin response for a post
- `GET /api/dashboard` - Get dashboard data
- `DELETE /api/clear` - Clear all data
- `POST /api/translate` - Translate text to English
- `GET /api/evidence/:postId` - Get evidence for a post
- `POST /api/factcheck/:postId` - Fact-check a post

## Environment Variables

### Backend (.env.local)
```
RAPIDAPI_KEY=
SERPAPI_KEY=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=3001
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3001
```

## License

Private project - All rights reserved

## Support

For issues and questions, please refer to:
- Backend documentation: `backend/README.md`
- Deployment guide: `DEPLOYMENT.md`
- Supabase setup: `backend/SUPABASE_SETUP.md`
