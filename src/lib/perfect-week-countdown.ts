import type { DashboardStats } from "@/types/database";

export function getPerfectWeekCountdown(state: DashboardStats): {
  perfectDays: number;
  daysLeftInWeek: number;
  needed: number;
  onTrack: boolean;
} {
  const meta = (state.dailyCompletion?.metadata ?? {}) as { perfect_days_week?: string[] };
  const perfectDays = (meta.perfect_days_week ?? []).length;
  const day = new Date().getDay();
  const daysLeftInWeek = day === 0 ? 0 : 7 - day;
  const needed = Math.max(0, 5 - perfectDays);
  return {
    perfectDays,
    daysLeftInWeek,
    needed,
    onTrack: perfectDays >= 5 || needed <= daysLeftInWeek,
  };
}

export function suggestDeloadWeek(state: DashboardStats): boolean {
  const readiness = (state.profile.settings as { readiness_log?: { recommendation: string }[] })?.readiness_log ?? [];
  const recent = readiness.slice(-5);
  const recoverCount = recent.filter((r) => r.recommendation === "recover").length;
  return recoverCount >= 3;
}
