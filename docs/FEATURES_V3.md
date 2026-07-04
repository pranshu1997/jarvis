# Jarvis Features V3 — Implementation Status

Post-V2 batch covering platform integrations, AI depth, gamification endgame, daily UX, workout/analytics, and polish (items A–BH).

## Platform & integrations

| # | Feature | Status |
|---|---------|--------|
| A | Supabase cloud sync | ⚠️ Stub `/api/sync/cloud` — timestamp only; full Postgres sync still future |
| B | Apple Health auto-sync template | ✅ `docs/apple-health-shortcuts.md` |
| C | Google Fit / Health Connect import | ✅ `/api/health/google-fit` |
| D | Offline queue in `jarvisFetch` | ✅ Non-GET requests queue on network failure |
| E | Nexus live embed | ✅ `public/nexus-embed.html` |
| F | Scheduled auto-backup | ✅ `/api/backup/schedule` |
| G | Webhook events | ✅ `/api/webhooks` + `lib/webhooks.ts` |
| H | iOS widget v3 | ✅ `public/widget.html` updated to v3 |

## AI & intelligence

| # | Feature | Status |
|---|---------|--------|
| I | Coach memory | ✅ `lib/coach-memory.ts`, `/api/coach/history`, coach POST persists history |
| J | Coach auto-brief | ✅ `/api/coach/brief` |
| K | Coach-generated dungeon quests | ✅ `/api/coach/dungeon-gen` |
| L | Progress photo AI notes | ✅ `/api/photos/analyze` |
| M | Proactive nudges | ✅ `ProactiveNudgeBanner` |
| N | Sleep ↔ perfect-day correlation | ✅ `SleepPerfectDayChart` + `analytics-correlation.ts` |
| O | At-risk habit predictor | ✅ `lib/at-risk-habits.ts`, dashboard meta |

## Gamification depth

| # | Feature | Status |
|---|---------|--------|
| P | Rank milestone perks | ✅ `lib/rank-perks.ts`, `/api/rank-perks`, shop UI |
| Q | Shadow Monarch skill tree | ✅ `lib/monarch-skills.ts`, `/api/skill-tree`, shop UI |
| R | Boss rush mode | ✅ `lib/boss-rush.ts`, `/api/boss-rush` |
| S | Main quest chapters 6–10 | ✅ `main-quest.ts` endgame arc |
| T | Achievement share cards | ✅ `/api/achievements/share` (SVG) |
| U | Combo visualization | ✅ `ComboTrail` |
| V | Category guild wars | ✅ `lib/guild-wars.ts`, dashboard meta |
| W | Habit dependency chains | ✅ `lib/habit-dependencies.ts`, `/api/habits/dependencies` |
| X | Quest expiration alerts | ⚠️ ReminderScheduler covers habits; quest-specific alerts partial |

## Daily-use UX

| # | Feature | Status |
|---|---------|--------|
| Y | Apply purchased cosmetics | ✅ `CosmeticApplier` + `lib/cosmetics.ts` |
| Z | Today Mission mode | ✅ `/app/mobile/mission` |
| AA | Mobile More swipe | ⚠️ More hub links; full swipe nav deferred |
| AB | Habit drag-reorder mobile | ⚠️ API exists; dedicated swipe-reorder component deferred |
| AC | Quest board kanban | ✅ `QuestKanban` on desktop quests |
| AD | Timeline filters | ✅ `TimelineFilters` component |
| AE | Macro target rings | ✅ `MacroTargetRings` on mobile stats |
| AF | Measurement trend alerts | ✅ `MeasurementTrendAlert` |
| AG | Archived habits browser | ✅ `ArchivedHabitsPanel` + `/api/habits/archived` |
| AH | Profile customization | ✅ `ProfileCustomizer` on mobile profile |

## Workout & body

| # | Feature | Status |
|---|---------|--------|
| AI | Superset / circuit logging | ✅ `/api/workouts/superset` |
| AJ | Drop set + failure reps | ✅ Metadata on superset log |
| AK | Workout readiness gate | ✅ `lib/workout-readiness.ts` |
| AL | Sport drill templates | ✅ `lib/sport-drills.ts`, `/api/sports/drill` |
| AM | Body comp score | ✅ `lib/body-comp-score.ts` |
| AN | PR prediction (1RM) | ✅ `lib/pr-prediction.ts` |

## Analytics & reflection

| # | Feature | Status |
|---|---------|--------|
| AO | Monthly evolution report | ✅ `/api/reports/monthly` |
| AP | Category balance radar | ✅ `CategoryRadarChart` |
| AQ | Habit ROI ranking | ✅ `HabitROIChart` |
| AR | Export dossier | ✅ `/api/reports/dossier` (markdown) |
| AS | Compare any two weeks | ✅ `WeekComparePicker` + `/api/reports/compare` |
| AT | Heatmap export | ✅ `/api/analytics/heatmap-export` (SVG) |

## Polish & feel

| # | Feature | Status |
|---|---------|--------|
| AU | Sound theme pack | ⚠️ Setting field added; preset wiring partial |
| AV | Rank-up cinematic (S/Monarch) | ✅ `RankUpCinematic` |
| AW | Perfect week reliability | ✅ Existing game-logic + overlay |
| AX | Settings reorganization | ✅ `SettingsTabs` component (integrate in settings page as needed) |
| AY | Tablet layout | ✅ `useTabletLayout` + `TabletLayoutWrapper` |
| AZ | Light mode | ✅ `theme_mode` + CSS `.light-mode` |
| BA | Demo → real profile migration | ✅ `/api/demo/migrate` |
| BB | Debrief modal v2 | ✅ Evening review + tomorrow priority |
| BC | Seasonal event banner | ✅ `SeasonalEventBanner` |
| BD | Pin quest from mobile | ✅ `PinQuestMobile` |
| BE | Last workout quick-resume | ✅ `LastWorkoutResume` on Train tab |
| BF | Shadow coin earn toast | ✅ `CoinEarnToast` + `jarvis-coin-earned` event |
| BG | Dungeon weakness hint | ✅ `DungeonWeaknessHint` |
| BH | Keyboard cheat sheet (`?`) | ✅ `KeyboardCheatSheet` |

## New API routes (V3)

- Coach: `GET/DELETE /api/coach/history`, `GET /api/coach/brief`, `POST /api/coach/dungeon-gen`
- Health: `POST /api/health/google-fit`
- Platform: `GET/POST /api/webhooks`, `GET/POST /api/sync/cloud`, `GET/POST /api/backup/schedule`
- Reports: `GET /api/reports/monthly`, `GET /api/reports/dossier`, `GET /api/reports/compare`
- Gamification: `GET/POST /api/skill-tree`, `GET/POST /api/boss-rush`, `GET/POST /api/rank-perks`
- Habits: `GET /api/habits/archived`, `POST /api/habits/dependencies`
- Workout: `POST /api/workouts/superset`, `GET/POST /api/sports/drill`
- Other: `POST /api/photos/analyze`, `POST /api/demo/migrate`, `GET /api/achievements/share`, `GET /api/analytics/heatmap-export`

## New pages

- `/app/mobile/mission` — single-card Today Mission mode

## Still optional / future

- Full Supabase game-state sync to Postgres
- Native WidgetKit / Scriptable widget (HTML bookmark + embed provided)
- Sound theme presets fully wired in `feedback.ts`
- Mobile swipe between More sub-pages
- Quest expiration push notifications
- PDF export (markdown dossier provided; PDF generation deferred)
