import type { Supplement } from "@/types/database";
import { levelFromXp, rankFromLevel } from "@/lib/xp-engine";

export function computeSupplementStackLevel(supplements: Supplement[]) {
  const active = supplements.filter((s) => s.is_active);
  const totalXp = active.reduce((s, sup) => s + sup.total_xp, 0);
  const level = levelFromXp(totalXp);
  const avgAdherence =
    active.length > 0
      ? Math.round(
          active.reduce((s, sup) => s + sup.adherence_score, 0) / active.length
        )
      : 0;
  const totalStreak = active.reduce((s, sup) => s + sup.current_streak, 0);

  return {
    level,
    rank: rankFromLevel(level),
    totalXp,
    avgAdherence,
    totalStreak,
    takenToday: active.filter((s) => s.taken_today).length,
    total: active.length,
  };
}
