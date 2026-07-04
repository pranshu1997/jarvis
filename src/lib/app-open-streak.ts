import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";
import type { DashboardStats } from "@/types/database";

export function recordAppOpen(state: DashboardStats): { streak: number; isNew: boolean } {
  const ext = getExtended(state.profile);
  const today = todayISO();
  const log = ext.app_open_log ?? [];
  if (log[log.length - 1] === today) {
    return { streak: ext.app_open_streak ?? 1, isNew: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  const prevStreak = ext.app_open_streak ?? 0;
  const streak = log[log.length - 1] === yKey ? prevStreak + 1 : 1;

  patchExtended(state.profile, {
    app_open_log: [...log, today].slice(-90),
    app_open_streak: streak,
  });
  return { streak, isNew: true };
}

export function getAppOpenStreak(state: DashboardStats): number {
  return getExtended(state.profile).app_open_streak ?? 0;
}
