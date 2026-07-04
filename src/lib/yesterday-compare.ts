import { getActivityCalendar } from "@/lib/player-settings-extended";
import type { DashboardStats } from "@/types/database";

export function getYesterdayCompare(state: DashboardStats): {
  yesterdayXp: number;
  todayXp: number;
  delta: number;
  yesterdayPct: number;
  todayPct: number;
} {
  const calendar = getActivityCalendar(state);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  const yesterdayXp = calendar[yKey]?.total_xp ?? 0;
  const todayXp =
    state.todayXpEarned ??
    state.recentXpEvents
      .filter((e) => e.created_at.startsWith(today))
      .reduce((s, e) => s + e.final_xp, 0);

  const dc = state.dailyCompletion;
  const todayPct =
    dc && dc.total_habits > 0
      ? Math.round((dc.completed_habits / dc.total_habits) * 100)
      : 0;

  const activeCount = state.habits.filter((h) => h.is_active).length;
  const yesterdayPct =
    activeCount > 0 && yesterdayXp > 0
      ? Math.min(100, Math.round((yesterdayXp / (activeCount * 15)) * 100))
      : 0;

  return {
    yesterdayXp,
    todayXp,
    delta: todayXp - yesterdayXp,
    yesterdayPct,
    todayPct,
  };
}
