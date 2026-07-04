import { getExtended } from "@/lib/player-settings-extended";
import type { DashboardStats, Habit, Profile } from "@/types/database";

export function isHabitSnoozed(profile: Profile, habitId: string): boolean {
  const until = getExtended(profile).habit_snooze?.[habitId];
  if (!until) return false;
  return new Date(until).getTime() > Date.now();
}

export function getSnoozedHabitIds(state: DashboardStats): string[] {
  const snooze = getExtended(state.profile).habit_snooze ?? {};
  const now = Date.now();
  return Object.entries(snooze)
    .filter(([, until]) => new Date(until).getTime() > now)
    .map(([id]) => id);
}

export function filterSnoozedHabits(habits: Habit[], profile: Profile): Habit[] {
  return habits.filter((h) => !isHabitSnoozed(profile, h.id));
}

export function countSnoozedHabits(state: DashboardStats): number {
  return getSnoozedHabitIds(state).length;
}
