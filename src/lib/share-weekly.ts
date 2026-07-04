import type { DashboardStats } from "@/types/database";

export function buildWeeklyShareSvg(state: DashboardStats): string {
  const dc = state.dailyCompletion;
  const pct = dc && dc.total_habits > 0 ? Math.round((dc.completed_habits / dc.total_habits) * 100) : 0;
  const xp = state.recentXpEvents
    .filter((e) => e.created_at.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((s, e) => s + e.final_xp, 0);
  const streak = Math.max(0, ...state.habits.filter((h) => h.is_active).map((h) => h.current_streak));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
    <rect width="400" height="240" rx="16" fill="#0c1929"/>
    <text x="200" y="40" text-anchor="middle" fill="#67e8f9" font-size="12" font-family="monospace">JARVIS WEEKLY</text>
    <text x="200" y="90" text-anchor="middle" fill="#22d3ee" font-size="48" font-weight="bold">${pct}%</text>
    <text x="200" y="115" text-anchor="middle" fill="#a5f3fc" font-size="14">Today complete</text>
    <text x="100" y="170" text-anchor="middle" fill="#fbbf24" font-size="20" font-weight="bold">${streak}</text>
    <text x="100" y="190" text-anchor="middle" fill="#67e8f9" font-size="10">Best streak</text>
    <text x="300" y="170" text-anchor="middle" fill="#22d3ee" font-size="20" font-weight="bold">+${xp}</text>
    <text x="300" y="190" text-anchor="middle" fill="#67e8f9" font-size="10">XP today</text>
    <text x="200" y="225" text-anchor="middle" fill="#67e8f9" font-size="10" opacity="0.5">${state.profile.rank}-RANK · Lv.${state.profile.player_level}</text>
  </svg>`;
}
