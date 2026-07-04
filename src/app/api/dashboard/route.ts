import { NextResponse } from "next/server";
import { getDemoDashboard } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isLocalAuthMode } from "@/lib/auth/config";
import { isDemoMode } from "@/lib/auth/demo";
import { getDemoModeState } from "@/lib/demo-session";
import { getLocalSessionUser } from "@/lib/auth/session";
import { loadAndPrepareUserState } from "@/lib/local/mutations";
import { bootstrapGameState } from "@/lib/local/bootstrap";
import { saveUser } from "@/lib/local/store";
import { syncAchievements } from "@/lib/achievements-db";
import { getActiveDungeon, ensureDungeonQuest } from "@/lib/dungeons";
import { getTodayReadiness } from "@/lib/readiness";
import { getShadowCoins } from "@/lib/player-settings-extended";
import { getAdaptiveSuggestions } from "@/lib/adaptive-habits";
import { generateWeeklyQuestsIfNeeded } from "@/lib/weekly-quest-gen";
import { advanceMainQuestIfNeeded, getCurrentMainQuestChapter } from "@/lib/main-quest";
import { spawnSeasonalEventQuests, getActiveSeasonalEvent } from "@/lib/seasonal-events";
import { computeGuildWarLeader, finalizeGuildWarIfNeeded } from "@/lib/guild-wars";
import { getAtRiskHabits, getStallingCategories } from "@/lib/at-risk-habits";
import { getExpiringQuests, getUrgentQuestCount } from "@/lib/quest-expiry";
import { isDoubleXpActive } from "@/lib/double-xp";
import { getBossRushState } from "@/lib/boss-rush";
import { getExtended } from "@/lib/player-settings-extended";
import { recordAppOpen, getAppOpenStreak } from "@/lib/app-open-streak";
import { getNextBestAction } from "@/lib/next-best-action";
import { getPerfectWeekCountdown } from "@/lib/perfect-week-countdown";
import { suggestDeloadWeek } from "@/lib/perfect-week-countdown";
import { getGoalProgress } from "@/lib/evolution-goal";
import { getXpForecast } from "@/lib/xp-forecast";
import { getYesterdayCompare } from "@/lib/yesterday-compare";
import { countSnoozedHabits } from "@/lib/snooze-filter";
import { getTodayHealthSummary } from "@/lib/health-summary";
import { getWeekXpSparkline } from "@/lib/week-xp-sparkline";
import { getTodayWaterMl, WATER_GOAL_ML } from "@/lib/hydration";
import { getRecentNotes } from "@/lib/habit-notes";
import { getRankProgress } from "@/lib/rank-progress";
import { getQuickWinHabits } from "@/lib/quick-wins";
import { getDailyWin, getRecentDailyWins } from "@/lib/daily-win";
import { getNearUnlockAchievements } from "@/lib/achievement-hints";
import { shouldWarnComboBreak } from "@/lib/combo-warning";
import { categoryBalance } from "@/lib/analytics-correlation";

export async function GET() {
  if (isLocalAuthMode()) {
    if (await isDemoMode()) {
      const state = getDemoModeState();
      const todayXp = state.recentXpEvents
        .filter((e) => e.created_at.startsWith(new Date().toISOString().slice(0, 10)))
        .reduce((s, e) => s + e.final_xp, 0);
      return NextResponse.json({ ...state, todayXpEarned: todayXp, demo: true });
    }

    const sessionUser = await getLocalSessionUser();
    if (sessionUser) {
      const user = await loadAndPrepareUserState(sessionUser.id);
      if (user) {
        const state = user.game_state;
        const boot = bootstrapGameState(state, user.id);
        const weeklyNew = generateWeeklyQuestsIfNeeded(state);
        const seasonalNew = spawnSeasonalEventQuests(state);
        const mainQuestAdvanced = advanceMainQuestIfNeeded(state);
        const dungeonLinked = ensureDungeonQuest(state);
        finalizeGuildWarIfNeeded(state);
        recordAppOpen(state);
        const { achievements, changed: achievementsChanged } =
          syncAchievements(state);

        if (boot || weeklyNew || seasonalNew || mainQuestAdvanced || dungeonLinked || achievementsChanged) {
          await saveUser(user);
        }

        const todayXp = state.recentXpEvents
          .filter((e) => e.created_at.startsWith(new Date().toISOString().slice(0, 10)))
          .reduce((s, e) => s + e.final_xp, 0);
        return NextResponse.json({
          ...state,
          todayXpEarned: todayXp,
          meta: {
            achievements,
            readiness: getTodayReadiness(state),
            dungeon: getActiveDungeon(state),
            shadowCoins: getShadowCoins(state),
            adaptive: getAdaptiveSuggestions(state),
            mainQuestChapter: getCurrentMainQuestChapter(state),
            seasonalEvent: getActiveSeasonalEvent(),
            guildWar: computeGuildWarLeader(state),
            atRiskHabits: getAtRiskHabits(state).length,
            stallingCategories: getStallingCategories(state),
            expiringQuests: getExpiringQuests(state, 48),
            urgentQuestCount: getUrgentQuestCount(state),
            doubleXp: isDoubleXpActive(),
            bossRush: getBossRushState(state),
            todayIntention: getExtended(state.profile).today_intention ?? null,
            appOpenStreak: getAppOpenStreak(state),
            nextBestAction: getNextBestAction(state),
            perfectWeek: getPerfectWeekCountdown(state),
            deloadSuggested: suggestDeloadWeek(state),
            evolutionGoal: getGoalProgress(state),
            coinHistory: (getExtended(state.profile).coin_log ?? []).slice(-10),
            atRiskList: getAtRiskHabits(state).slice(0, 5),
            xpForecast: getXpForecast(state),
            yesterdayCompare: getYesterdayCompare(state),
            snoozedCount: countSnoozedHabits(state),
            healthSummary: getTodayHealthSummary(state),
            weekXpSparkline: getWeekXpSparkline(state),
            waterTodayMl: getTodayWaterMl(state),
            waterGoalMl: WATER_GOAL_ML,
            recentHabitNotes: getRecentNotes(state, 5),
            weeklyFocusCategory: getExtended(state.profile).weekly_focus_category ?? null,
            resilienceScore: getExtended(state.profile).resilience_score ?? 0,
            profileTitle: getExtended(state.profile).profile_title ?? null,
            rankProgress: getRankProgress(state),
            quickWins: getQuickWinHabits(state, 3).map((h) => ({ id: h.id, name: h.name })),
            dailyWin: getDailyWin(state),
            recentDailyWins: getRecentDailyWins(state, 5),
            achievementHints: getNearUnlockAchievements(state, 3),
            comboWarning: shouldWarnComboBreak(state),
            categoryBalance: categoryBalance(state),
          },
        });
      }
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ...getDemoDashboard(), demo: true });
  }

  return NextResponse.json({ ...getDemoDashboard(), demo: true });
}
