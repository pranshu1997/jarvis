# Jarvis — Original Spec vs Current Build

Legend: ✅ Done · ⚠️ Partial · ❌ Missing · 🔄 Different (intentional improvement)

## Architecture & platform

| Requirement | Status | Notes |
|-------------|--------|-------|
| Single Next.js codebase | ✅ | |
| Separate desktop / mobile UX | ✅ | Command center vs RPG HUD |
| Shared backend | ✅ | Local `data/*.json` default; Supabase schema ready |
| Vercel deployable | ✅ | |
| PWA installable | ✅ | manifest, icons, next-pwa |
| PWA offline | ⚠️ | Service worker; habit actions need network in local mode |
| Private single-user | 🔄 | Local auth + disk storage (better than guest SaaS) |

## Auth (spec vs today)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Supabase Auth | ⚠️ | Schema + callback route; cloud path not fully wired to game APIs |
| Google login | ⚠️ | Button when Supabase env set; game data still local unless cloud mode finished |
| Guest mode | ⚠️ | **Demo mode** added — try without account |
| Username/password | 🔄 | Added (not in original spec; fits private use) |
| Touch ID / WebAuthn | 🔄 | Added (not in original spec) |

## Core game

| Requirement | Status | Notes |
|-------------|--------|-------|
| 4 categories + XP/level/streak/rank | ✅ | |
| Player level + power/discipline/momentum/consistency | ⚠️ | Displayed; scores now update on actions |
| Multiplicative XP | ✅ | streak, combo, consistency, momentum, bonuses |
| Perfect day bonus | ✅ | |
| Perfect week bonus | ⚠️ | Added in XP engine + tracking |
| Solo Leveling ranks | ✅ | E → Monarch |
| Seeded core habits | ✅ | All spec habits in seed |
| Dynamic DB-driven UI | ✅ | No hardcoded habit lists in components |
| Custom habit + toughness × baseline | ✅ | Settings + dashboard + mobile |
| Category XP includes new habits | ✅ | Portfolio formula |

## Supplements

| Requirement | Status | Notes |
|-------------|--------|-------|
| 5 supplements seeded | ✅ | |
| Per-supplement XP/level/streak/adherence | ✅ | |
| Log UI + API | ✅ | Vitality stack |
| Overall supplement level | ⚠️ | Aggregate card added |

## Workout / sports / skills

| Requirement | Status | Notes |
|-------------|--------|-------|
| Skill tree hierarchy | ✅ | DB + UI on Workout tab |
| Muscle groups + exercises | ✅ | |
| PR tracking | ✅ | |
| Workout sessions | ✅ | Start/end + log attach |
| Sports levels (per sport) | ✅ | Log session API |
| Exercise progression graph | ⚠️ | Chart on workout page |
| Frequency score | ✅ | Increments on log |

## Quests

| Requirement | Status | Notes |
|-------------|--------|-------|
| Daily / weekly / main / side / dungeon types | ✅ | Seeded |
| Auto-progress on habits | ✅ | Category + perfect day + habit streak |
| Custom quest create | ✅ | Settings |

## Pages & UX

| Requirement | Status | Notes |
|-------------|--------|-------|
| Landing / login | ✅ | |
| Desktop dashboard + analytics + timeline | ✅ | |
| Mobile HUD + swipe + log | ✅ | |
| Workout, quests, stats, profile, settings | ✅ | |
| XP float + level-up + haptics | ✅ | |
| Achievements | ⚠️ | Derived milestones panel (no separate DB table UI) |
| Heatmaps / graphs | ⚠️ | Analytics; heatmap simplified |
| Settings: custom categories | ❌ | Not implemented (large schema change) |
| Settings: configure XP formulas | ❌ | Documented; sliders not built |

## Intentional differences (better for your use case)

- **Local-first auth** instead of guest-only — data persists in `data/users.json`
- **Sessions on disk** — survive `npm run dev` restarts
- **Touch ID** for daily login on Mac/iPhone

See README for setup. Remaining ❌ items are optional v2 (custom categories, full Supabase game sync).
