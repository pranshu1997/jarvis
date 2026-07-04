import { getTodayReadiness } from "@/lib/readiness";
import type { DashboardStats } from "@/types/database";

export function getWorkoutReadinessGate(state: DashboardStats): {
  recommendation: "push" | "maintain" | "recover";
  deloadPercent: number;
  message: string;
} {
  const readiness = getTodayReadiness(state);
  const rec = readiness?.recommendation ?? "maintain";

  if (rec === "recover") {
    return {
      recommendation: rec,
      deloadPercent: 0.7,
      message: "Recovery day — consider 70% working weight or mobility work",
    };
  }
  if (rec === "maintain") {
    return {
      recommendation: rec,
      deloadPercent: 0.9,
      message: "Moderate readiness — 90% working weight recommended",
    };
  }
  return {
    recommendation: rec,
    deloadPercent: 1,
    message: "Full send — readiness is high",
  };
}
