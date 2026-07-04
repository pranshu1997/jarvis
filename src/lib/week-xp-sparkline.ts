import type { DashboardStats } from "@/types/database";

export function getWeekXpSparkline(state: DashboardStats): { day: string; xp: number }[] {
  const byDay: Record<string, number> = {};
  for (const e of state.recentXpEvents) {
    const day = e.created_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + e.final_xp;
  }

  const result: { day: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ day: key.slice(5), xp: byDay[key] ?? 0 });
  }
  return result;
}
