import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { DashboardStats } from "@/types/database";
import { todayISO } from "@/lib/utils";

function weekKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export function computeGuildWarLeader(state: DashboardStats): {
  week: string;
  leader: string;
  xpByCategory: Record<string, number>;
} {
  const week = weekKey();
  const xpByCategory: Record<string, number> = {};
  for (const cat of state.categories) {
    xpByCategory[cat.slug] = cat.total_xp;
  }
  const leader = Object.entries(xpByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "physical";
  return { week, leader, xpByCategory };
}

export function finalizeGuildWarIfNeeded(state: DashboardStats): boolean {
  const ext = getExtended(state.profile);
  const history = ext.guild_war_history ?? [];
  const lastWeek = history[history.length - 1]?.week;
  const currentWeek = weekKey();

  if (lastWeek === currentWeek) return false;

  const { leader, xpByCategory } = computeGuildWarLeader(state);
  history.push({
    week: currentWeek,
    winner_slug: leader,
    xp_by_category: xpByCategory,
    bonus_coins: 50,
  });
  patchExtended(state.profile, { guild_war_history: history.slice(-12) });
  return true;
}

export function getGuildWarHistory(state: DashboardStats) {
  return getExtended(state.profile).guild_war_history ?? [];
}
