import type { DashboardStats } from "@/types/database";
import {
  getExtended,
  patchExtended,
  type ReadinessEntry,
} from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";

export function computeReadiness(
  sleep: number,
  energy: number,
  soreness: number
): { score: number; recommendation: ReadinessEntry["recommendation"] } {
  const score = Math.round(
    ((sleep / 5) * 40 + (energy / 5) * 40 + ((6 - soreness) / 5) * 20)
  );
  const clamped = Math.max(0, Math.min(100, score));
  let recommendation: ReadinessEntry["recommendation"] = "maintain";
  if (clamped >= 75) recommendation = "push";
  else if (clamped < 45) recommendation = "recover";
  return { score: clamped, recommendation };
}

export function logReadiness(
  state: DashboardStats,
  sleep: number,
  energy: number,
  soreness: number
): ReadinessEntry {
  const { score, recommendation } = computeReadiness(sleep, energy, soreness);
  const entry: ReadinessEntry = {
    date: todayISO(),
    sleep,
    energy,
    soreness,
    score,
    recommendation,
  };
  const log = [...(getExtended(state.profile).readiness_log ?? [])];
  const idx = log.findIndex((e) => e.date === entry.date);
  if (idx >= 0) log[idx] = entry;
  else log.push(entry);
  patchExtended(state.profile, { readiness_log: log.slice(-90) });
  return entry;
}

export function getTodayReadiness(state: DashboardStats): ReadinessEntry | null {
  const today = todayISO();
  return getExtended(state.profile).readiness_log?.find((e) => e.date === today) ?? null;
}
