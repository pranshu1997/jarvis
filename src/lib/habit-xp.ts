import type { Habit } from "@/types/database";

/** Meditation habit is the 1.0× toughness reference. */
export const HABIT_BASELINE_SLUG = "meditate";
export const DEFAULT_BASELINE_XP = 15;

export type HabitXpMetadata = {
  category_slug?: string;
  toughness?: number;
  baseline_slug?: string;
  current_value?: number;
};

export function computeHabitBaseXp(baselineXp: number, toughness: number): number {
  const t = Math.max(0.25, Math.min(5, toughness));
  return Math.max(5, Math.round(baselineXp * t));
}

export function getHabitMetadata(habit: Habit): HabitXpMetadata {
  return (habit.metadata ?? {}) as HabitXpMetadata;
}

export function resolveBaselineXp(habits: Habit[], baselineSlug: string): number {
  const baseline = habits.find((h) => h.slug === baselineSlug);
  return baseline?.base_xp ?? DEFAULT_BASELINE_XP;
}

/** Effective base XP for the XP engine (custom habits use toughness × baseline). */
export function getHabitBaseXp(habit: Habit, habits: Habit[]): number {
  const meta = getHabitMetadata(habit);
  if (habit.is_system && meta.toughness == null) {
    return habit.base_xp;
  }
  const toughness = meta.toughness ?? 1;
  const baselineSlug = meta.baseline_slug ?? HABIT_BASELINE_SLUG;
  const baselineXp = resolveBaselineXp(habits, baselineSlug);
  return computeHabitBaseXp(baselineXp, toughness);
}

export function categoryXpFromHabits(
  catHabits: Habit[],
  allHabits: Habit[]
): { earned: number; portfolio: number; total: number } {
  const earned = catHabits.reduce((s, h) => s + h.total_xp, 0);
  const portfolio = catHabits.reduce(
    (s, h) => s + getHabitBaseXp(h, allHabits),
    0
  );
  const total = earned + Math.round(portfolio * 0.12);
  return { earned, portfolio, total };
}
