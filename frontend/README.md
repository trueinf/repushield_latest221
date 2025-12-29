# Repushield Frontend

React + TypeScript frontend application for Repushield Web Application.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

The frontend proxies `/api` requests to `http://localhost:3001` (backend server).

### 3. Build for Production

```bash
npm run build
```

## Environment Variables

Optional: Create a `.env.local` file to configure the API URL:

```env
VITE_API_URL=http://localhost:3001/api
```

If not set, it defaults to `/api` (which will be proxied to the backend).

## Features

- React 18 with TypeScript
- Vite for fast development
- Radix UI components
- Tailwind CSS for styling
- Search functionality integrated with backend API





