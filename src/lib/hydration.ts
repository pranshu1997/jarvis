import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";
import type { DashboardStats } from "@/types/database";

export function getTodayWaterMl(state: DashboardStats): number {
  const log = getExtended(state.profile).water_log ?? {};
  return log[todayISO()] ?? 0;
}

export function logWater(state: DashboardStats, ml: number): number {
  const today = todayISO();
  const ext = getExtended(state.profile);
  const log = { ...(ext.water_log ?? {}) };
  log[today] = (log[today] ?? 0) + ml;
  patchExtended(state.profile, { water_log: log });
  return log[today];
}

export const WATER_GOAL_ML = 2500;
