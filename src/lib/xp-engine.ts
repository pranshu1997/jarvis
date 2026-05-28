import type { RankTier } from "@/types/database";

export interface XpMultipliers {
  streak: number;
  combo: number;
  consistency: number;
  momentum: number;
  bonus: number;
}

export interface XpCalculationInput {
  baseXp: number;
  streakDays?: number;
  comboCount?: number;
  consistencyScore?: number;
  momentumScore?: number;
  isPerfectDay?: boolean;
  isPerfectWeek?: boolean;
  isCategoryComplete?: boolean;
}

export interface XpCalculationResult {
  baseXp: number;
  finalXp: number;
  multipliers: XpMultipliers;
}

const STREAK_THRESHOLDS = [
  { days: 30, multiplier: 2.5 },
  { days: 14, multiplier: 2.0 },
  { days: 7, multiplier: 1.75 },
  { days: 3, multiplier: 1.5 },
  { days: 1, multiplier: 1.25 },
];

export function getStreakMultiplier(streakDays: number): number {
  for (const t of STREAK_THRESHOLDS) {
    if (streakDays >= t.days) return t.multiplier;
  }
  return 1;
}

export function getComboMultiplier(comboCount: number): number {
  if (comboCount >= 10) return 2.0;
  if (comboCount >= 7) return 1.75;
  if (comboCount >= 5) return 1.5;
  if (comboCount >= 3) return 1.25;
  return 1;
}

export function getConsistencyMultiplier(score: number): number {
  if (score >= 90) return 1.5;
  if (score >= 75) return 1.35;
  if (score >= 50) return 1.2;
  if (score >= 25) return 1.1;
  return 1;
}

export function getMomentumMultiplier(score: number): number {
  if (score >= 80) return 1.4;
  if (score >= 60) return 1.25;
  if (score >= 40) return 1.15;
  return 1;
}

export function calculateXp(input: XpCalculationInput): XpCalculationResult {
  const streak = getStreakMultiplier(input.streakDays ?? 0);
  const combo = getComboMultiplier(input.comboCount ?? 0);
  const consistency = getConsistencyMultiplier(input.consistencyScore ?? 0);
  const momentum = getMomentumMultiplier(input.momentumScore ?? 0);

  let bonus = 1;
  if (input.isPerfectDay) bonus *= 1.5;
  if (input.isPerfectWeek) bonus *= 1.35;
  if (input.isCategoryComplete) bonus *= 1.25;

  const multipliers: XpMultipliers = {
    streak,
    combo,
    consistency,
    momentum,
    bonus,
  };

  const finalXp = Math.round(
    input.baseXp *
      streak *
      combo *
      consistency *
      momentum *
      bonus
  );

  return {
    baseXp: input.baseXp,
    finalXp: Math.max(finalXp, 1),
    multipliers,
  };
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + xpForLevel(level) <= totalXp) {
    xpNeeded += xpForLevel(level);
    level++;
  }
  return level;
}

export function xpProgressInLevel(totalXp: number, level: number): {
  current: number;
  required: number;
  percent: number;
} {
  let xpBeforeLevel = 0;
  for (let l = 1; l < level; l++) {
    xpBeforeLevel += xpForLevel(l);
  }
  const required = xpForLevel(level);
  const current = totalXp - xpBeforeLevel;
  const percent = Math.min(100, Math.round((current / required) * 100));
  return { current, required, percent };
}

const RANK_THRESHOLDS: { rank: RankTier; minLevel: number }[] = [
  { rank: "MONARCH", minLevel: 100 },
  { rank: "NATIONAL", minLevel: 80 },
  { rank: "S", minLevel: 60 },
  { rank: "A", minLevel: 45 },
  { rank: "B", minLevel: 30 },
  { rank: "C", minLevel: 20 },
  { rank: "D", minLevel: 10 },
  { rank: "E", minLevel: 1 },
];

export function rankFromLevel(level: number): RankTier {
  for (const t of RANK_THRESHOLDS) {
    if (level >= t.minLevel) return t.rank;
  }
  return "E";
}

export const RANK_COLORS: Record<RankTier, string> = {
  E: "#6b7280",
  D: "#22c55e",
  C: "#3b82f6",
  B: "#a855f7",
  A: "#f59e0b",
  S: "#ef4444",
  NATIONAL: "#00d4ff",
  MONARCH: "#ffd700",
};

export const RANK_LABELS: Record<RankTier, string> = {
  E: "E Rank",
  D: "D Rank",
  C: "C Rank",
  B: "B Rank",
  A: "A Rank",
  S: "S Rank",
  NATIONAL: "National Level",
  MONARCH: "Monarch",
};
