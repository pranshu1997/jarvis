# Jarvis Features V5 — Implementation Status

Daily-loop intelligence, evolution goals, sharing, and V4 gap closure.

## V4 gaps closed

| # | Feature | Status |
|---|---------|--------|
| A | Evolution goal UI panel | ✅ `EvolutionGoalPanel` + `/api/evolution-goal` |
| B | Habit lock badges wired in lists | ✅ `HabitList` + `SwipeHabitList` |
| C | Quest expiry browser notifications | ✅ `QuestExpiryNotifier` |
| D | Snooze in skip dialog | ✅ `SkipHabitDialog` + mobile dashboard/log |
| E | Printable dossier (HTML print) | ✅ `/api/reports/print` + `PrintableDossierButton` |

## Daily loop & intelligence

| # | Feature | Status |
|---|---------|--------|
| F | App open streak tracking | ✅ `app-open-streak.ts` + dashboard meta |
| G | App open streak badge | ✅ `AppOpenStreakBadge` |
| H | Next best action chip | ✅ `next-best-action.ts` + `NextBestActionChip` |
| I | Morning ritual strip (AM only) | ✅ `MorningRitualStrip` |
| J | Perfect week countdown | ✅ `perfect-week-countdown.ts` + UI |
| K | Deload week suggestion banner | ✅ `DeloadWeekBanner` |
| L | Streak milestone toast (7/14/30/60/90) | ✅ `StreakMilestoneToast` |
| M | Debrief shows today intention | ✅ `DebriefModal` |
| N | Quest countdown on cards | ✅ `QuestCountdown` in `QuestPanel` |
| O | Category complete-all button | ✅ `/api/habits/complete-category` + UI |
| P | Coin spend history panel | ✅ `CoinHistoryPanel` on shop |
| Q | Compact HUD mode toggle | ✅ `CompactModeToggle` + CSS |
| R | Sidebar quick stats (% today, coins, combo) | ✅ `SidebarQuickStats` |

## Body & training quick actions

| # | Feature | Status |
|---|---------|--------|
| S | Sport drill quick-log picker | ✅ `SportDrillPicker` on workout |
| T | Superset quick-log | ✅ `SupersetQuickLog` on workout |
| U | Macro quick-log presets | ✅ `MacroQuickLog` on workout |

## Sharing & reports

| # | Feature | Status |
|---|---------|--------|
| V | Weekly share SVG card | ✅ `/api/share/weekly` + `WeeklyShareButton` |
| W | Command palette: share week / print dossier | ✅ `CommandPalette` |

## New API routes (V5)

- `GET/POST /api/evolution-goal`
- `GET /api/share/weekly`
- `POST /api/habits/complete-category`
- `POST /api/app-open`
- `GET /api/reports/print`

## Dashboard meta additions

- `appOpenStreak`, `nextBestAction`, `perfectWeek`, `deloadSuggested`, `evolutionGoal`, `coinHistory`

## Still future

- Full Supabase Postgres sync
- Native push (iOS/Android) for quest expiry
- True PDF export (currently HTML print-to-PDF)
- Weekly focus category auto-quests from `weekly_focus_category` field
