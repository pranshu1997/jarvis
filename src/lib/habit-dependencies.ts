import { patchExtended } from "@/lib/player-settings-extended";
import type { DashboardStats, Habit } from "@/types/database";

export function isHabitUnlocked(state: DashboardStats, habit: Habit): boolean {
  const deps = (state.profile.settings as { habit_dependencies?: { habit_id: string; requires_habit_id: string; min_streak: number }[] })?.habit_dependencies ?? [];
  const habitDeps = deps.filter((d) => d.habit_id === habit.id);
  if (habitDeps.length === 0) return true;

  for (const dep of habitDeps) {
    const required = state.habits.find((h) => h.id === dep.requires_habit_id);
    if (!required || required.current_streak < dep.min_streak) return false;
  }
  return true;
}

export function getLockedHabits(state: DashboardStats): Habit[] {
  return state.habits.filter((h) => h.is_active && !isHabitUnlocked(state, h));
}

export function setHabitDependency(
  state: DashboardStats,
  habitId: string,
  requiresHabitId: string,
  minStreak: number
): void {
  const deps = ((state.profile.settings as { habit_dependencies?: { habit_id: string; requires_habit_id: string; min_streak: number }[] })?.habit_dependencies ?? [])
    .filter((d) => d.habit_id !== habitId);
  deps.push({ habit_id: habitId, requires_habit_id: requiresHabitId, min_streak: minStreak });
  patchExtended(state.profile, { habit_dependencies: deps });
}
