import type { DashboardStats } from "@/types/database";
import { getExtended } from "@/lib/player-settings-extended";

export function sleepPerfectDayCorrelation(state: DashboardStats): {
  dataPoints: { date: string; sleep: number; perfect: boolean }[];
  correlation: number;
} {
  const healthLog = getExtended(state.profile).health_sync_log ?? [];
  const perfectDays =
    ((state.dailyCompletion?.metadata as { perfect_days_week?: string[] })?.perfect_days_week ?? []);

  const dataPoints = healthLog
    .filter((e) => e.sleep_hours != null)
    .map((e) => ({
      date: e.date,
      sleep: e.sleep_hours!,
      perfect: perfectDays.includes(e.date),
    }));

  if (dataPoints.length < 3) return { dataPoints, correlation: 0 };

  const perfectSleeps = dataPoints.filter((d) => d.perfect).map((d) => d.sleep);
  const otherSleeps = dataPoints.filter((d) => !d.perfect).map((d) => d.sleep);
  const avgPerfect = perfectSleeps.length ? perfectSleeps.reduce((a, b) => a + b, 0) / perfectSleeps.length : 0;
  const avgOther = otherSleeps.length ? otherSleeps.reduce((a, b) => a + b, 0) / otherSleeps.length : 0;
  const correlation = avgPerfect - avgOther;

  return { dataPoints, correlation: Math.round(correlation * 100) / 100 };
}

export function habitROIRanking(state: DashboardStats): { habitId: string; title: string; score: number }[] {
  const calendar = getExtended(state.profile).activity_calendar ?? {};
  const perfectDates = new Set(
    ((state.dailyCompletion?.metadata as { perfect_days_week?: string[] })?.perfect_days_week ?? [])
  );

  const scores: Record<string, { title: string; perfectDays: number; totalDays: number }> = {};
  for (const habit of state.habits.filter((h) => h.is_active)) {
    scores[habit.id] = { title: habit.name, perfectDays: 0, totalDays: 0 };
  }

  for (const [date, entry] of Object.entries(calendar)) {
    for (const habitId of entry.habit_ids ?? []) {
      if (!scores[habitId]) continue;
      scores[habitId].totalDays++;
      if (perfectDates.has(date)) scores[habitId].perfectDays++;
    }
  }

  return Object.entries(scores)
    .map(([habitId, { title, perfectDays, totalDays }]) => ({
      habitId,
      title,
      score: totalDays > 0 ? Math.round((perfectDays / totalDays) * 100) : 0,
    }))
    .sort((a, b) => b.score - a.score);
}

export function categoryBalance(state: DashboardStats): Record<string, number> {
  const total = state.categories.reduce((s, c) => s + c.total_xp, 0) || 1;
  const balance: Record<string, number> = {};
  for (const cat of state.categories) {
    balance[cat.slug] = Math.round((cat.total_xp / total) * 100);
  }
  return balance;
}
