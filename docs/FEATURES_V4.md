# Jarvis Features V4 — Implementation Status

Closes V3 partials + daily-use depth, economy wiring, and polish.

## V3 gaps closed

| # | Feature | Status |
|---|---------|--------|
| A | Sound theme presets (default/arcade/minimal/solo) | ✅ Wired in `feedback.ts` + settings |
| B | Mobile More swipe nav | ✅ `MobileMoreSwipe` |
| C | Mobile habit drag-reorder | ✅ `SwipeReorderHabits` in settings |
| D | Quest expiration alerts | ✅ `QuestExpiryBanner` + `/api/quests/expiring` |
| E | Settings tabs integrated | ✅ `SettingsTabs` in desktop settings |
| F | Webhooks on rank-up / perfect day | ✅ `habits/complete` fires webhooks |
| G | Boss rush UI | ✅ `BossRushPanel` on dashboards |
| H | Habit dependency lock badges | ✅ `HabitLockBadge` |
| I | Skill tree + rank perk multipliers in XP/coins | ✅ `game-logic.ts` |
| J | Boss rush auto-advance on dungeon defeat | ✅ `advanceBossRush` hook |

## Daily loop & UX

| # | Feature | Status |
|---|---------|--------|
| K | Today's intention field | ✅ `TodayIntentionInput` |
| L | Sunday coach auto-brief modal | ✅ `SundayCoachBrief` |
| M | Double XP weekend banner | ✅ `DoubleXpBanner` + `double-xp.ts` |
| N | 14-day streak activity mini-chart | ✅ `StreakCalendarMini` |
| O | Guild war leader banner | ✅ `GuildWarBanner` |
| P | Pull-to-refresh mobile HUD | ✅ `PullToRefresh` |
| Q | Offline queue badge + flush | ✅ `OfflineQueueBadge` in sync indicator |
| R | Workout readiness banner | ✅ `WorkoutReadinessBanner` |
| S | PR prediction card (1RM) | ✅ `PRPredictionCard` |
| T | Level-up voice-line quotes | ✅ `LevelUpVoiceLine` |
| U | Quest kanban on mobile | ✅ Mobile quests page |
| V | Desktop analytics V3 charts | ✅ Radar, ROI, sleep, month compare |
| W | Achievement progress bars | ✅ Trophy room |
| X | Hunter prestige summary | ✅ `PrestigePanel` |
| Y | Coach one-click habit suggestions | ✅ `CoachSuggestHabits` + API |
| Z | Habit snooze until tomorrow | ✅ `/api/habits/snooze` |
| AA | Auto backup run-if-due on sync | ✅ `/api/backup/run-if-due` |
| AB | Particle boost cosmetic effect | ✅ `ParticleBoostOverlay` + CSS |
| AC | Keyboard `m` → mission mode | ✅ Command palette |
| AD | Deep links: mission, boss-rush | ✅ `/deep-link` |
| AE | Command palette: boss rush start | ✅ |
| AE | Combo haptic milestones | ✅ `useDashboard` at 5/10 combo |
| AF | Light mode toggle in settings | ✅ |
| AG | Webhook save/test in settings | ✅ |
| AH | Demo migrate button in settings | ✅ |
| AI | Month-over-month analytics | ✅ `/api/analytics/month-compare` |

## New API routes (V4)

- `GET /api/quests/expiring`
- `POST /api/habits/snooze`
- `GET /api/coach/suggest-habits`
- `GET /api/analytics/month-compare`
- `POST /api/backup/run-if-due`

## Still future

- Full Supabase Postgres sync
- Native push for quest expiry (browser notification permission flow partial)
- PDF export
- Evolution goal UI panel (lib exists: `evolution-goal.ts`)
