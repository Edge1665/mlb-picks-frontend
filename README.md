# MLB Picks Frontend (Next.js PWA + Supabase Auth)

Installable on iPhone (PWA) and Windows (Chrome/Edge).

## Features
- Email/password auth via Supabase
- PWA install support (manifest + service worker via `next-pwa`)
- Dashboard showing predictions from backend
- Live updates via WebSocket
- Mobile-first UI

## Setup
1. Create a Supabase project (free). Get the **Project URL** and **anon public key**.
2. Copy `.env.example` to `.env.local` and fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Set `NEXT_PUBLIC_API_BASE` to your backend URL and `NEXT_PUBLIC_WS_URL` to your backend WebSocket URL.
4. Install deps and run locally:
```bash
npm install
npm run dev
```
5. Deploy on Vercel (free). Add the same env vars in the Vercel dashboard.

## iPhone install
Open the site in Safari → Share → **Add to Home Screen**.

