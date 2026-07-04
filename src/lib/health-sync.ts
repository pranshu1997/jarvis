import type { DashboardStats } from "@/types/database";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { HealthSyncEntry } from "@/lib/player-settings-extended";
import { getHabitCategorySlug } from "@/lib/game-logic";

export interface HealthImportPayload {
  steps?: number;
  sleep_hours?: number;
  hrv?: number;
  weight_kg?: number;
  date: string;
}

export interface HealthSyncResult {
  stored: boolean;
  habitsAutoCompleted: string[];
  weightLogged: boolean;
}

const STEPS_HABIT_SLUGS = ["walk", "steps", "walking", "10k-steps", "step-count"];
const SLEEP_HABIT_SLUGS = ["sleep", "sleep-8h", "sleep-quality", "rest"];

/** Store health data into extended settings and auto-complete matching awareness habits. */
export function processHealthImport(
  state: DashboardStats,
  payload: HealthImportPayload
): HealthSyncResult {
  const ext = getExtended(state.profile);
  const log = ext.health_sync_log ?? [];

  const entry: HealthSyncEntry = {
    date: payload.date,
    steps: payload.steps,
    sleep_hours: payload.sleep_hours,
    hrv: payload.hrv,
    weight_kg: payload.weight_kg,
    synced_at: new Date().toISOString(),
  };

  const existingIdx = log.findIndex((e) => e.date === payload.date);
  if (existingIdx >= 0) {
    log[existingIdx] = { ...log[existingIdx], ...entry };
  } else {
    log.push(entry);
  }

  // Keep last 90 days
  const trimmed = log
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90);

  patchExtended(state.profile, { health_sync_log: trimmed });

  const habitsAutoCompleted: string[] = [];
  const isToday = payload.date === new Date().toISOString().slice(0, 10);

  if (isToday) {
    for (const habit of state.habits) {
      if (!habit.is_active || habit.completed_today) continue;
      const catSlug = getHabitCategorySlug(habit);
      if (catSlug !== "awareness") continue;

      const slug = habit.slug.toLowerCase();

      if (payload.steps != null && payload.steps >= 8000 && STEPS_HABIT_SLUGS.some((s) => slug.includes(s))) {
        habit.completed_today = true;
        habitsAutoCompleted.push(habit.id);
      }

      if (payload.sleep_hours != null && payload.sleep_hours >= 7 && SLEEP_HABIT_SLUGS.some((s) => slug.includes(s))) {
        habit.completed_today = true;
        habitsAutoCompleted.push(habit.id);
      }
    }
  }

  let weightLogged = false;
  if (payload.weight_kg != null && isToday) {
    weightLogged = true;
  }

  return { stored: true, habitsAutoCompleted, weightLogged };
}

/** Get the most recent health sync entry. */
export function getLatestHealthEntry(state: DashboardStats): HealthSyncEntry | null {
  const log = getExtended(state.profile).health_sync_log ?? [];
  if (log.length === 0) return null;
  return log[log.length - 1];
}

/** Get health entries for the last N days. */
export function getRecentHealthEntries(state: DashboardStats, days = 7): HealthSyncEntry[] {
  const log = getExtended(state.profile).health_sync_log ?? [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return log.filter((e) => e.date >= cutoffStr);
}
