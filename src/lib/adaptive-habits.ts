import type { DashboardStats, Habit } from "@/types/database";
import { getActivityCalendar } from "@/lib/player-settings-extended";

export interface AdaptiveSuggestion {
  habitId: string;
  habitName: string;
  type: "evolve" | "step_down";
  message: string;
}

export function getAdaptiveSuggestions(state: DashboardStats): AdaptiveSuggestion[] {
  const cal = getActivityCalendar(state);
  const dates = Object.keys(cal).sort().slice(-28);
  const out: AdaptiveSuggestion[] = [];

  for (const habit of state.habits.filter((h) => h.is_active)) {
    const rate = completionRate(habit, cal, dates);
    if (rate >= 0.9 && habit.current_streak >= 28) {
      out.push({
        habitId: habit.id,
        habitName: habit.name,
        type: "evolve",
        message: `You've mastered ${habit.name} (${Math.round(rate * 100)}% over 4 weeks). Evolve it?`,
      });
    } else if (rate < 0.5 && dates.length >= 14) {
      out.push({
        habitId: habit.id,
        habitName: habit.name,
        type: "step_down",
        message: `${habit.name} is below 50% completion — consider a temporary step-down.`,
      });
    }
  }

  return out.slice(0, 3);
}

function completionRate(
  habit: Habit,
  cal: Record<string, { habit_ids: string[] }>,
  dates: string[]
): number {
  if (!dates.length) return 0;
  let hits = 0;
  for (const d of dates) {
    if (cal[d]?.habit_ids.includes(habit.id)) hits++;
  }
  return hits / dates.length;
}
