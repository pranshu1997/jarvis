import type { DashboardStats, Habit } from "@/types/database";
import { getExtended, patchExtended, type PhoenixWindow } from "@/lib/player-settings-extended";
import { calculateXp } from "@/lib/xp-engine";
import { getHabitBaseXp } from "@/lib/habit-xp";
import { todayISO } from "@/lib/utils";

export function getPhoenixWindow(habit: Habit): PhoenixWindow | null {
  const w = (habit.metadata as { phoenix_window?: PhoenixWindow }).phoenix_window;
  if (!w) return null;
  if (w.until < todayISO()) return null;
  return w;
}

export function openPhoenixWindow(habit: Habit, previousStreak: number): void {
  const until = new Date();
  until.setDate(until.getDate() + 2);
  habit.metadata = {
    ...(habit.metadata as object),
    phoenix_window: {
      until: until.toISOString().slice(0, 10),
      previous_streak: previousStreak,
    },
  };
}

export function applyPhoenixOnComplete(
  state: DashboardStats,
  habit: Habit
): number {
  const w = getPhoenixWindow(habit);
  if (!w) return 0;

  const restored = Math.max(1, w.previous_streak - 1);
  habit.current_streak = restored;
  habit.longest_streak = Math.max(habit.longest_streak, restored);

  const meta = { ...(habit.metadata as object) };
  delete (meta as { phoenix_window?: PhoenixWindow }).phoenix_window;
  habit.metadata = meta;

  const ext = getExtended(state.profile);
  patchExtended(state.profile, {
    resilience_score: (ext.resilience_score ?? 0) + 1,
  });

  const base = getHabitBaseXp(habit, state.habits);
  return calculateXp({
    baseXp: Math.round(base * 0.5),
    streakDays: restored,
    momentumScore: state.profile.momentum_score,
    consistencyScore: state.profile.consistency_score,
  }).finalXp;
}

export function processStreakBreaksOnReset(state: DashboardStats): void {
  for (const habit of state.habits) {
    if (!habit.is_active) continue;
    const meta = habit.metadata as { skipped_today?: boolean };
    if (meta.skipped_today) continue;

    if (!habit.completed_today && habit.current_streak > 0) {
      openPhoenixWindow(habit, habit.current_streak);
      habit.current_streak = 0;
    }
  }
}
