import type { Habit } from "@/types/database";

export type HabitPeriod = "morning" | "afternoon" | "evening" | "anytime";

export const HABIT_PERIODS: { id: HabitPeriod; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "anytime", label: "Anytime" },
];

const DEFAULT_PERIOD_BY_SLUG: Record<string, HabitPeriod> = {
  meditate: "morning",
  news: "morning",
  skincare: "morning",
  beardcare: "morning",
  haircare: "morning",
  workout_habit: "afternoon",
  sports_habit: "afternoon",
  fighting_habit: "afternoon",
  work: "afternoon",
  read: "afternoon",
  upskill: "afternoon",
  puzzles: "afternoon",
  poker: "afternoon",
  journal: "evening",
  sleep: "evening",
  flexibility: "anytime",
  mobility: "anytime",
  steps_5k: "anytime",
  water_intake: "anytime",
  dont_smoke: "anytime",
  diet_tracking: "anytime",
  weight_tracking: "anytime",
  follow_diet: "anytime",
};

export function getHabitPeriod(habit: Habit): HabitPeriod {
  const meta = habit.metadata as { preferred_period?: HabitPeriod };
  if (meta.preferred_period) return meta.preferred_period;
  return DEFAULT_PERIOD_BY_SLUG[habit.slug] ?? "anytime";
}

export function filterHabitsByPeriod(habits: Habit[], period: HabitPeriod): Habit[] {
  return habits.filter((h) => h.is_active && getHabitPeriod(h) === period);
}

export function getCurrentPeriod(): HabitPeriod {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "evening";
}
