import type { DashboardStats } from "@/types/database";
import { getHabitCategorySlug } from "@/lib/game-logic";
import {
  getActivityCalendar,
  patchExtended,
  type ActivityDayEntry,
} from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";

export function logHabitToCalendar(
  state: DashboardStats,
  habitId: string,
  xpEarned: number
): void {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;

  const today = todayISO();
  const cal = { ...getActivityCalendar(state) };
  const cat = getHabitCategorySlug(habit);
  const entry: ActivityDayEntry = cal[today] ?? {
    physical: 0,
    mental: 0,
    awareness: 0,
    vitality: 0,
    habit_ids: [],
    total_xp: 0,
  };

  const catHabits = state.habits.filter(
    (h) => h.is_active && getHabitCategorySlug(h) === cat
  );
  const done = catHabits.filter((h) => h.completed_today).length;
  const frac = catHabits.length ? done / catHabits.length : 0;

  entry[cat as keyof Pick<ActivityDayEntry, "physical" | "mental" | "awareness" | "vitality">] = frac;
  if (!entry.habit_ids.includes(habitId)) entry.habit_ids.push(habitId);
  entry.total_xp += xpEarned;

  cal[today] = entry;
  patchExtended(state.profile, { activity_calendar: cal });
}

export function getCalendarDays(
  state: DashboardStats,
  weeks = 12
): { date: string; entry: ActivityDayEntry | null }[] {
  const cal = getActivityCalendar(state);
  const out: { date: string; entry: ActivityDayEntry | null }[] = [];
  const end = new Date();
  const days = weeks * 7;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, entry: cal[key] ?? null });
  }
  return out;
}
