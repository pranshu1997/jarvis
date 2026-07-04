# Jarvis Features V6 — Implementation Status

Intelligence depth, snooze/filtering, hydration, notes, and mobile parity.

## V5 gaps closed

| # | Feature | Status |
|---|---------|--------|
| A | Weekly focus category → bonus quest | ✅ `WeeklyFocusCategoryPicker` + quest gen |
| B | Snoozed habits hidden from lists | ✅ `snooze-filter.ts` + banner |
| C | Notification permission nudge | ✅ `NotificationPermissionNudge` |
| D | Habit user sort order in all lists | ✅ `HabitList` + `SwipeHabitList` |
| E | Profile title in header | ✅ `ProfileTitlePicker` + `PlayerHeader` |

## Daily loop & intelligence

| # | Feature | Status |
|---|---------|--------|
| F | At-risk habits panel (one-tap complete) | ✅ `AtRiskHabitsPanel` |
| G | XP day forecast card | ✅ `xp-forecast.ts` + UI |
| H | Yesterday vs today XP compare chip | ✅ `yesterday-compare.ts` + UI |
| I | Evening wind-down strip (5–11pm) | ✅ `EveningWindDownStrip` |
| J | Resilience score badge | ✅ `ResilienceBadge` sidebar/profile |
| K | Health sync mini banner (steps/sleep/HRV) | ✅ `health-summary.ts` + UI |
| L | Habit completion notes | ✅ `/api/habits/note` + `HabitNoteButton` |
| M | Recent habit notes panel | ✅ `RecentHabitNotesPanel` |
| N | Quest sort by expiry | ✅ `QuestPanel` |
| O | Keyboard `N` → complete next habit | ✅ `useKeyboardShortcuts` |
| P | Coach context-aware quick prompts | ✅ `CoachQuickPrompts` |

## Body & vitality

| # | Feature | Status |
|---|---------|--------|
| Q | Hydration tracking + quick log | ✅ `/api/hydration` + `HydrationQuickLog` |
| R | Water progress bar on dashboard | ✅ dashboard meta `waterTodayMl` |

## Mobile parity

| # | Feature | Status |
|---|---------|--------|
| S | Complete Next FAB | ✅ `CompleteNextFab` |
| T | Mobile weekly share + print | ✅ mobile weekly page |
| U | Mobile evolution goal + title picker | ✅ mobile profile/weekly |

## Sidebar & analytics

| # | Feature | Status |
|---|---------|--------|
| V | 7-day XP sparkline in sidebar | ✅ `WeekXpSparkline` |

## New API routes (V6)

- `POST /api/habits/note`
- `GET/POST /api/hydration`
- `PATCH /api/profile/settings` — `weeklyFocusCategory`

## Dashboard meta additions

- `atRiskList`, `xpForecast`, `yesterdayCompare`, `snoozedCount`, `healthSummary`, `weekXpSparkline`, `waterTodayMl`, `waterGoalMl`, `recentHabitNotes`, `weeklyFocusCategory`, `resilienceScore`, `profileTitle`

## Still future

- Full Supabase Postgres sync
- Native push (iOS/Android)
- True PDF export
- Auto-quest from weekly focus text (not just category)
