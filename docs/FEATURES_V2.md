# Jarvis Features V2 — Implementation Status

## Quick wins

| # | Feature | Status |
|---|---------|--------|
| 1 | Rich calendar heatmap | ✅ |
| 2 | Habit edit + archive | ✅ |
| 3 | Phoenix / resilience bonus | ✅ + ceremony overlay |
| 4 | Persistent achievements (~40) | ✅ |
| 5 | Home screen widget | ✅ |
| 6 | Daily readiness score | ✅ + mobile strip |
| 7 | Per-habit reminders | ✅ |

## Medium

| # | Feature | Status |
|---|---------|--------|
| 8 | Body measurements | ✅ |
| 9 | Habit routines / chains | ✅ |
| 10 | Shadow Coin shop | ✅ + cosmetic items |
| 11 | Progressive overload hints | ✅ |
| 12 | Dungeon boss battles | ✅ + multi-phase bosses |
| 13 | Weekly quest auto-gen | ✅ |
| 14 | Macro logger | ✅ |
| 15 | Adaptive difficulty prompts | ✅ |

## Large features (this batch)

| # | Feature | Status |
|---|---------|--------|
| 16 | JARVIS AI Coach | ✅ Rule-based + Claude if `ANTHROPIC_API_KEY` |
| 17 | Health API sync | ✅ Manual import card + `/api/health/import` |
| 18 | Character evolution | ✅ |
| 19 | Progress photos | ✅ Gallery + `/api/photos` |
| 20 | Cloud sync | ⚠️ Schema exists; game APIs still local-first |
| 21 | Custom categories | ✅ `/api/categories` + settings UI |
| 22 | XP formula sliders | ✅ `xp-config.ts` + settings |
| 23 | Main quest storyline | ✅ 5 chapters + panel |
| 24 | Seasonal events | ✅ Auto-spawn quests |
| 25 | Mobile parity (trophy/shop/weekly/analytics/coach) | ✅ + More tab |
| 26 | Onboarding wizard | ✅ First-run flow |
| 27 | Morning entry mode | ✅ Redirect to `/mobile/today` |
| 28 | Command palette + keyboard shortcuts | ✅ ⌘K, 1-9, u, f |
| 29 | Workout rest timer + templates + RPE | ✅ |
| 30 | PR celebration overlay | ✅ |
| 31 | Analytics date filters + week comparison | ✅ |
| 32 | Year recap page | ✅ `/app/desktop/year-recap` |
| 33 | Weekly report + calendar export | ✅ `/api/reports/weekly`, `/api/calendar/feed` |
| 34 | Auto backup | ✅ `/api/backup/auto` |
| 35 | Offline queue | ✅ `lib/offline-queue.ts` |
| 36 | Deep links | ✅ `/deep-link?action=complete&habitId=…` |
| 37 | Nexus snapshot API | ✅ `/api/nexus/snapshot` |
| 38 | Rank-themed HUD | ✅ `RankThemeProvider` |
| 39 | Sidebar grouping + coin balance | ✅ |
| 40 | Pinned habits | ✅ |
| 41 | Streak shield inventory UI | ✅ |
| 42 | Phoenix + Perfect Week overlays | ✅ |
| 43 | Skip snooze presets (busy/forgot) | ✅ |
| 44 | Collapsible dashboard sections | ✅ |
| 45 | Skeleton loaders | ✅ |
| 46 | Reduced motion toggle | ✅ Settings |
| 47 | Sync indicator + manual refresh | ✅ |

## New routes (API)

- `POST /api/coach` · `POST /api/health/import` · `GET/POST/DELETE /api/photos`
- `GET /api/reports/weekly` · `GET /api/calendar/feed` · `POST /api/backup/auto`
- `GET/POST /api/categories` · `POST /api/habits/pin` · `GET /api/nexus/snapshot`
- `GET/POST/DELETE /api/workouts/templates`

## New pages

- Mobile: `/app/mobile/trophy`, `shop`, `weekly`, `analytics`, `coach`, `more`
- Desktop: `/app/desktop/year-recap`
- Deep link: `/deep-link`

## Still optional / future

- Full Supabase game sync (F)
- Automated Apple Health / Google Fit OAuth (manual import ready)
- True cloud PWA offline habit queue wiring in all API calls
- AI progress photo analysis
