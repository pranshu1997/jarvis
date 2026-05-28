# Project: jarvis

## Stack
- TypeScript, Next.js (App Router), React
- Supabase (auth, DB)
- UI: Radix, Tailwind

## Test / lint commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Key directories
- Source: `src/app/`, `src/components/`
- API routes: `src/app/api/`

## Project-specific conventions
- Do not commit `.env.local` or Supabase secrets
- WebAuthn and session routes under `src/app/api/auth/`
