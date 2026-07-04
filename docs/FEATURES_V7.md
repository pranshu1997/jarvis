# Jarvis Features V7 — Implementation Status

Rank progression, quick wins, daily wins, settings depth, and mobile fixes.

## Mission & today fixes

| # | Feature | Status |
|---|---------|--------|
| A | Mission mode respects snooze + sort order | ✅ `mobile/mission` |
| B | Today page snooze filter + sort order | ✅ `mobile/today` |

## Progression & gamification

| # | Feature | Status |
|---|---------|--------|
| C | Rank-up progress meter (levels to next rank) | ✅ `rank-progress.ts` + `RankProgressMeter` |
| D | Quick wins panel (lowest XP habits first) | ✅ `quick-wins.ts` + UI |
| E | Streak leaderboard mini (top 5) | ✅ `StreakLeaderboardMini` |
| F | Category balance chip on dashboard | ✅ `CategoryBalanceChip` |
| G | Achievement near-unlock hints | ✅ `achievement-hints.ts` + trophy/dashboard |
| H | Combo break warning banner (evening) | ✅ `combo-warning.ts` + UI |

## Daily reflection

| # | Feature | Status |
|---|---------|--------|
| I | Daily win capture field | ✅ `/api/daily-win` + `DailyWinInput` |
| J | Daily win in end-of-day debrief | ✅ `DebriefModal` |

## Intelligence panels

| # | Feature | Status |
|---|---------|--------|
| K | Stalling categories panel + complete-all | ✅ `StallingCategoriesPanel` |
| L | Pinned quest picker | ✅ `PinnedQuestPicker` |
| M | Widget snapshot preview card | ✅ `WidgetPreviewCard` |

## Settings & integrations

| # | Feature | Status |
|---|---------|--------|
| N | Habit reminder time picker UI | ✅ `HabitReminderSettings` |
| O | Morning mode toggle | ✅ `MorningModeToggle` |
| P | Calendar subscribe button (ICS feed) | ✅ `CalendarSubscribeButton` |
| Q | Activity calendar CSV export | ✅ `/api/analytics/activity-export` |

## Focus & shortcuts

| # | Feature | Status |
|---|---------|--------|
| R | Focus mode pomodoro overlay | ✅ `FocusPomodoroOverlay` |
| S | Command palette: log 500ml water | ✅ `CommandPalette` |

## Mobile parity

| # | Feature | Status |
|---|---------|--------|
| T | Mobile workout: sport drills, hydration, macros | ✅ `mobile/workout` |

## New API routes (V7)

- `POST /api/daily-win`
- `GET /api/analytics/activity-export`

## Dashboard meta additions

- `rankProgress`, `quickWins`, `dailyWin`, `recentDailyWins`, `achievementHints`, `comboWarning`, `categoryBalance`

## Still future

- Full Supabase Postgres sync
- Native push (iOS/Android)
- True PDF export
- iOS home screen widget (preview only for now)
