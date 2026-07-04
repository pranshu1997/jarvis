import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";
import type { DashboardStats } from "@/types/database";

export function getDailyWin(state: DashboardStats): string | null {
  const ext = getExtended(state.profile);
  const wins = ext.daily_wins ?? {};
  return wins[todayISO()] ?? null;
}

export function setDailyWin(state: DashboardStats, win: string): void {
  const today = todayISO();
  const ext = getExtended(state.profile);
  patchExtended(state.profile, {
    daily_wins: { ...(ext.daily_wins ?? {}), [today]: win.trim() },
  });
}

export function getRecentDailyWins(state: DashboardStats, limit = 7): { date: string; win: string }[] {
  const wins = getExtended(state.profile).daily_wins ?? {};
  return Object.entries(wins)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, limit)
    .map(([date, win]) => ({ date, win }));
}
