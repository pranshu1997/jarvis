import type { DashboardStats } from "@/types/database";
import { categoryBalance } from "@/lib/analytics-correlation";
import { getAtRiskHabits } from "@/lib/at-risk-habits";

export function getNextBestAction(state: DashboardStats): {
  label: string;
  action: "complete_habit" | "readiness" | "category" | "quest" | "rest";
  habitId?: string;
  categorySlug?: string;
} {
  const atRisk = getAtRiskHabits(state);
  if (atRisk[0]) {
    return { label: `Complete "${atRisk[0].habit.name}" — streak at risk`, action: "complete_habit", habitId: atRisk[0].habit.id };
  }

  const incomplete = state.habits.find((h) => h.is_active && !h.completed_today);
  if (incomplete) {
    return { label: `Next: ${incomplete.name}`, action: "complete_habit", habitId: incomplete.id };
  }

  const balance = categoryBalance(state);
  const weakest = Object.entries(balance).sort((a, b) => a[1] - b[1])[0]?.[0];
  if (weakest) {
    return { label: `Boost ${weakest} pillar today`, action: "category", categorySlug: weakest };
  }

  const activeQuest = state.quests.find((q) => q.status === "active");
  if (activeQuest) {
    return { label: `Progress quest: ${activeQuest.title}`, action: "quest" };
  }

  return { label: "All clear — recovery or train", action: "rest" };
}
