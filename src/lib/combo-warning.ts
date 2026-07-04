import type { DashboardStats } from "@/types/database";
import { getComboCount } from "@/lib/player-settings";

export function shouldWarnComboBreak(state: DashboardStats): {
  warn: boolean;
  combo: number;
  incomplete: number;
} {
  const hour = new Date().getHours();
  const combo = getComboCount(state);
  const incomplete = state.habits.filter((h) => h.is_active && !h.completed_today).length;
  const warn = hour >= 18 && combo >= 3 && incomplete > 0;
  return { warn, combo, incomplete };
}
