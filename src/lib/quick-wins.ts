import { getHabitBaseXp } from "@/lib/habit-xp";
import { filterSnoozedHabits } from "@/lib/snooze-filter";
import type { DashboardStats, Habit } from "@/types/database";

export function getQuickWinHabits(state: DashboardStats, limit = 3): Habit[] {
  const pool = filterSnoozedHabits(
    state.habits.filter((h) => h.is_active && !h.completed_today),
    state.profile
  );
  return [...pool]
    .sort((a, b) => getHabitBaseXp(a, state.habits) - getHabitBaseXp(b, state.habits))
    .slice(0, limit);
}
