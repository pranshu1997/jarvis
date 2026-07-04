import type { DashboardStats, Habit } from "@/types/database";

export const STREAK_MILESTONES = [7, 14, 21, 30, 60, 100, 365];

export function getNewStreakMilestone(habit: Habit, previousStreak: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (previousStreak < m && habit.current_streak >= m) return m;
  }
  return null;
}

export function getTopStreakHabit(state: DashboardStats): Habit | null {
  const active = state.habits.filter((h) => h.is_active);
  if (active.length === 0) return null;
  return active.reduce((best, h) => (h.current_streak > best.current_streak ? h : best));
}

export function getStreakCalendarDays(state: DashboardStats, days = 14): { date: string; completed: boolean }[] {
  const calendar = (state.profile.settings as { activity_calendar?: Record<string, { habit_ids?: string[] }> })?.activity_calendar ?? {};
  const result: { date: string; completed: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = calendar[key];
    result.push({ date: key, completed: (entry?.habit_ids?.length ?? 0) > 0 });
  }
  return result;
}
