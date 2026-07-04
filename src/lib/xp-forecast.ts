import { getHabitBaseXp } from "@/lib/habit-xp";
import type { DashboardStats } from "@/types/database";

export function getXpForecast(state: DashboardStats): {
  earnedToday: number;
  remainingXp: number;
  potentialTotal: number;
  incompleteCount: number;
  percentDone: number;
} {
  const earnedToday =
    state.recentXpEvents
      .filter((e) => e.created_at.startsWith(new Date().toISOString().slice(0, 10)))
      .reduce((s, e) => s + e.final_xp, 0) ?? state.todayXpEarned ?? 0;

  const incomplete = state.habits.filter((h) => h.is_active && !h.completed_today);
  const remainingXp = incomplete.reduce(
    (s, h) => s + getHabitBaseXp(h, state.habits),
    0
  );
  const potentialTotal = earnedToday + remainingXp;
  const dc = state.dailyCompletion;
  const total = dc?.total_habits ?? state.habits.filter((h) => h.is_active).length;
  const done = dc?.completed_habits ?? state.habits.filter((h) => h.is_active && h.completed_today).length;
  const percentDone = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    earnedToday,
    remainingXp,
    potentialTotal,
    incompleteCount: incomplete.length,
    percentDone,
  };
}
