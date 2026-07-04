import { getExtended } from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";
import type { DashboardStats } from "@/types/database";

export function getTodayHealthSummary(state: DashboardStats): {
  steps?: number;
  sleep_hours?: number;
  hrv?: number;
  weight_kg?: number;
  synced_at?: string;
} | null {
  const log = getExtended(state.profile).health_sync_log ?? [];
  const today = todayISO();
  const entry = [...log].reverse().find((e) => e.date === today);
  if (!entry) return null;
  return {
    steps: entry.steps,
    sleep_hours: entry.sleep_hours,
    hrv: entry.hrv,
    weight_kg: entry.weight_kg,
    synced_at: entry.synced_at,
  };
}
