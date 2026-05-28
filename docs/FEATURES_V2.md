# Jarvis Features V2 — Implementation Status

## Quick wins

| # | Feature | Status |
|---|---------|--------|
| 1 | Rich calendar heatmap | ✅ Analytics page + activity log on complete |
| 2 | Habit edit + archive | ✅ `/api/habits/update`, `/api/habits/archive`, `HabitEditDialog` |
| 3 | Phoenix / resilience bonus | ✅ Streak break on reset + 2-day recovery window |
| 4 | Persistent achievements (~40) | ✅ Trophy Room + unlock on dashboard load |
| 5 | Home screen widget | ✅ `/public/widget.html` + `/api/widgets/snapshot` |
| 6 | Daily readiness score | ✅ Morning check-in + Push/Maintain/Recover |
| 7 | Per-habit reminders | ✅ `ReminderScheduler` + settings `habitReminders` |

## Medium

| # | Feature | Status |
|---|---------|--------|
| 8 | Body measurements | ✅ `/api/measurements` + Stats card |
| 9 | Habit routines / chains | ✅ `RoutinePanel` + `/api/routines/complete` |
| 10 | Shadow Coin shop | ✅ `/app/desktop/shop` + coins on XP |
| 11 | Progressive overload hints | ✅ Workout log target row |
| 12 | Dungeon boss battles | ✅ `DungeonBossBar` + HP damage on habits |
| 13 | Weekly quest auto-gen | ✅ Mondays via `generateWeeklyQuestsIfNeeded` |
| 14 | Macro logger | ✅ `/api/macros` + Stats card |
| 15 | Adaptive difficulty prompts | ✅ Dashboard adaptive banner |

## Large (partial / planned)

| # | Feature | Status |
|---|---------|--------|
| 16 | JARVIS AI coach | 🔶 Stub page `/app/desktop/coach` |
| 17 | Health API sync | ❌ Not started |
| 18 | Character evolution | ✅ `CharacterEvolution` on Stats |
| 19 | Progress photos + AI | ❌ Not started |
| 20 | Cloud sync | ❌ Schema exists; APIs still local |

## New routes

- `PATCH /api/habits/update` · `POST /api/habits/archive` · `PATCH /api/habits/reorder`
- `POST /api/readiness` · `POST/GET /api/measurements`
- `GET/POST /api/shop` · `POST /api/routines/complete`
- `GET/POST/PATCH /api/macros` · `GET /api/widgets/snapshot`

## New pages

- `/app/desktop/trophy` · `/app/desktop/shop` · `/app/desktop/coach`
- `/public/widget.html` (bookmark or add to home screen)
