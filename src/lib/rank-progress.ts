import { xpProgressInLevel } from "@/lib/xp-engine";
import type { DashboardStats, RankTier } from "@/types/database";

const RANK_ORDER: RankTier[] = ["E", "D", "C", "B", "A", "S", "NATIONAL", "MONARCH"];

const RANK_MIN_LEVEL: Record<RankTier, number> = {
  E: 1,
  D: 10,
  C: 20,
  B: 30,
  A: 45,
  S: 60,
  NATIONAL: 80,
  MONARCH: 100,
};

export function getRankProgress(state: DashboardStats): {
  currentRank: RankTier;
  nextRank: RankTier | null;
  currentLevel: number;
  levelsToNext: number;
  percentToNext: number;
} {
  const currentLevel = state.profile.player_level;
  const currentRank = state.profile.rank;
  const idx = RANK_ORDER.indexOf(currentRank);
  const nextRank = idx >= 0 && idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1]! : null;

  if (!nextRank) {
    return { currentRank, nextRank: null, currentLevel, levelsToNext: 0, percentToNext: 100 };
  }

  const targetLevel = RANK_MIN_LEVEL[nextRank];
  const levelsToNext = Math.max(0, targetLevel - currentLevel);
  const xp = xpProgressInLevel(state.profile.total_xp, currentLevel);
  const percentToNext = levelsToNext === 0
    ? 100
    : Math.min(99, Math.round(((currentLevel - RANK_MIN_LEVEL[currentRank]) / (targetLevel - RANK_MIN_LEVEL[currentRank])) * 100 + xp.percent / levelsToNext));

  return { currentRank, nextRank, currentLevel, levelsToNext, percentToNext };
}
