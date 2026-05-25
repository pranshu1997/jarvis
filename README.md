# Jarvis — Personal Evolution System

A private, full-stack personal productivity RPG inspired by Solo Leveling and Iron Man's JARVIS. Level yourself up in real life across **Physical**, **Mental**, **Awareness**, and **Vitality**.

> **Not a SaaS product.** This is a single-user private system.

## Features

- **Dual experience**: Tactical desktop command center + mobile RPG HUD (not responsive clones)
- **Dynamic systems**: Habits, categories, quests, supplements, and workouts render from the database
- **XP engine**: Multiplicative progression (streak, combo, consistency, momentum, perfect-day bonuses)
- **Solo Leveling ranks**: E → D → C → B → A → S → National → Monarch
- **PWA**: Installable on iOS/Android with offline support
- **Auth**: Google OAuth via Supabase + Guest demo mode

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, ShadCN-style UI, Framer Motion, Zustand, Recharts |
| Backend | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel |

## Quick Start (Local)

### 1. Clone & install

```bash
git clone https://github.com/pranshu-bansal/jarvis.git
cd jarvis
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials. **Guest mode works without Supabase** using built-in demo data.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- **Guest Mode** — instant demo with seeded habits/quests
- **Google Login** — requires Supabase setup below

## Supabase Setup

### 1. Create project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy **Project URL** and **anon public key** to `.env.local`

### 2. Run migrations

In Supabase SQL Editor, run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`

### 3. Enable Google Auth

1. Supabase Dashboard → **Authentication** → **Providers** → Google
2. Add OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
3. Set redirect URL: `https://<project-ref>.supabase.co/auth/v1/callback`
4. In Supabase → **URL Configuration**, add:
   - Site URL: `http://localhost:3000` (dev) or your Vercel URL
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://your-app.vercel.app/auth/callback`

### 4. Bootstrap user data

On first login, system templates (`user_id IS NULL`) are cloned to the user via the app API. Run seed SQL first so templates exist.

## Vercel Deployment

### 1. Push to GitHub

```bash
git push origin master
```

### 2. Import on Vercel

1. [vercel.com](https://vercel.com) → Import `jarvis` repository
2. Framework: **Next.js** (auto-detected)

### 3. Environment variables

Add in Vercel → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### 4. Deploy

Vercel deploys on push. Update Supabase redirect URLs with your production domain.

### 5. PWA on mobile

1. Open your Vercel URL in Safari (iOS) or Chrome (Android)
2. **Add to Home Screen**
3. App launches fullscreen as Jarvis

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing / login
│   ├── app/
│   │   ├── desktop/          # Command center UI
│   │   └── mobile/           # RPG HUD UI
│   └── api/                  # Dashboard & habit APIs
├── components/
│   ├── desktop/              # Sidebar, panels
│   ├── mobile/               # Bottom nav, swipe cards
│   ├── features/             # Habits, quests, categories
│   └── effects/              # XP bars, particles, level-up
├── lib/
│   ├── xp-engine.ts          # XP formulas & ranks
│   └── demo-data.ts          # Guest mode seed
├── stores/                   # Zustand state
└── types/                    # TypeScript types
supabase/
├── migrations/               # PostgreSQL schema
└── seed.sql                  # System habits & quests
```

## XP Formula

```
Final XP = Base XP × Streak × Combo × Consistency × Momentum × Bonus
```

| Multiplier | Example |
|------------|---------|
| Streak 7+ days | 1.75× |
| Streak 30+ days | 2.5× |
| Perfect day | 1.5× bonus |
| Category complete | 1.25× bonus |

## Routes

| Desktop | Mobile |
|---------|--------|
| `/app/desktop/dashboard` | `/app/mobile/dashboard` |
| `/app/desktop/quests` | `/app/mobile/quests` |
| `/app/desktop/stats` | `/app/mobile/stats` |
| `/app/desktop/workout` | `/app/mobile/log` |
| `/app/desktop/analytics` | `/app/mobile/profile` |
| `/app/desktop/timeline` | |
| `/app/desktop/settings` | |

Middleware auto-redirects `/app` to desktop or mobile based on device.

## Legacy

The previous Streamlit task board is preserved in `legacy-streamlit/`.

## License

Private — personal use only.
