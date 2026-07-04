import type { DashboardStats, Habit } from "@/types/database";
import { todayISO } from "@/lib/utils";

export interface AtRiskHabit {
  habit: Habit;
  riskScore: number;
  reason: string;
}

export function getAtRiskHabits(state: DashboardStats): AtRiskHabit[] {
  const hour = new Date().getHours();
  if (hour < 12) return [];

  const atRisk: AtRiskHabit[] = [];
  for (const habit of state.habits) {
    if (!habit.is_active || habit.completed_today || habit.current_streak === 0) continue;

    let riskScore = 0;
    let reason = "";

    if (hour >= 20) {
      riskScore += 40;
      reason = "Evening — streak at risk";
    } else if (hour >= 17) {
      riskScore += 25;
      reason = "Late afternoon — not completed yet";
    } else {
      riskScore += 10;
      reason = "Not completed yet today";
    }

    if (habit.current_streak >= 7) {
      riskScore += 20;
      reason = `${habit.current_streak}-day streak at risk`;
    }

    if (riskScore >= 25) {
      atRisk.push({ habit, riskScore, reason });
    }
  }

  return atRisk.sort((a, b) => b.riskScore - a.riskScore);
}

export function getStallingCategories(state: DashboardStats, days = 4): string[] {
  const calendar = (state.profile.settings as { activity_calendar?: Record<string, { physical: number; mental: number; awareness: number; vitality: number }> })?.activity_calendar ?? {};
  const today = todayISO();
  const stalling: string[] = [];

  for (const cat of state.categories) {
    let inactiveDays = 0;
    for (let i = 1; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (key >= today) continue;
      const entry = calendar[key];
      const xp = entry?.[cat.slug as keyof typeof entry] ?? 0;
      if (!xp || xp === 0) inactiveDays++;
    }
    if (inactiveDays >= days - 1) stalling.push(cat.slug);
  }
  return stalling;
}
