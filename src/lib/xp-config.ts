import type { Profile } from "@/types/database";
import { getExtended } from "@/lib/player-settings-extended";
import type { XpFormulaConfig } from "@/lib/player-settings-extended";
import type { XpCalculationInput, XpCalculationResult } from "@/lib/xp-engine";
import { calculateXp, getStreakMultiplier, getComboMultiplier, getConsistencyMultiplier, getMomentumMultiplier } from "@/lib/xp-engine";

export type { XpFormulaConfig };

export const XP_FORMULA_DEFAULTS: XpFormulaConfig = {
  base_xp_scale: 1.0,
  streak_weight: 1.0,
  combo_weight: 1.0,
  consistency_weight: 1.0,
  momentum_weight: 1.0,
  perfect_day_bonus: 1.5,
  category_complete_bonus: 1.25,
};

export const XP_FORMULA_LABELS: Record<keyof XpFormulaConfig, string> = {
  base_xp_scale: "Base XP Scale",
  streak_weight: "Streak Multiplier Weight",
  combo_weight: "Combo Multiplier Weight",
  consistency_weight: "Consistency Multiplier Weight",
  momentum_weight: "Momentum Multiplier Weight",
  perfect_day_bonus: "Perfect Day Bonus",
  category_complete_bonus: "Category Complete Bonus",
};

export const XP_FORMULA_RANGES: Record<keyof XpFormulaConfig, { min: number; max: number; step: number }> = {
  base_xp_scale: { min: 0.5, max: 3.0, step: 0.1 },
  streak_weight: { min: 0, max: 2.0, step: 0.05 },
  combo_weight: { min: 0, max: 2.0, step: 0.05 },
  consistency_weight: { min: 0, max: 2.0, step: 0.05 },
  momentum_weight: { min: 0, max: 2.0, step: 0.05 },
  perfect_day_bonus: { min: 1.0, max: 3.0, step: 0.05 },
  category_complete_bonus: { min: 1.0, max: 2.0, step: 0.05 },
};

export function getXpConfig(profile: Profile): XpFormulaConfig {
  const ext = getExtended(profile);
  return { ...XP_FORMULA_DEFAULTS, ...(ext.xp_formula_config ?? {}) };
}

/**
 * Like calculateXp but applies profile-level formula weights.
 * Weights scale how much each multiplier component "bends" away from 1.0.
 * A weight of 0 disables the multiplier entirely; 1.0 is default behaviour.
 */
export function calculateXpWithConfig(
  input: XpCalculationInput,
  config: XpFormulaConfig
): XpCalculationResult {
  const scaledBase = Math.round(input.baseXp * config.base_xp_scale);

  const rawStreak = getStreakMultiplier(input.streakDays ?? 0);
  const rawCombo = getComboMultiplier(input.comboCount ?? 0);
  const rawConsistency = getConsistencyMultiplier(input.consistencyScore ?? 0);
  const rawMomentum = getMomentumMultiplier(input.momentumScore ?? 0);

  // Scale each multiplier: weight 0 => 1.0, weight 1 => default, weight 2 => squared
  const applyWeight = (raw: number, weight: number) => 1 + (raw - 1) * weight;

  const streak = applyWeight(rawStreak, config.streak_weight);
  const combo = applyWeight(rawCombo, config.combo_weight);
  const consistency = applyWeight(rawConsistency, config.consistency_weight);
  const momentum = applyWeight(rawMomentum, config.momentum_weight);

  let bonus = 1;
  if (input.isPerfectDay) bonus *= config.perfect_day_bonus;
  if (input.isPerfectWeek) bonus *= 1.35;
  if (input.isCategoryComplete) bonus *= config.category_complete_bonus;

  const finalXp = Math.round(scaledBase * streak * combo * consistency * momentum * bonus);

  return {
    baseXp: scaledBase,
    finalXp: Math.max(finalXp, 1),
    multipliers: { streak, combo, consistency, momentum, bonus },
  };
}

/**
 * Convenience wrapper: resolves config from profile then calculates.
 */
export function calculateXpForProfile(
  profile: Profile,
  input: XpCalculationInput
): XpCalculationResult {
  const config = getXpConfig(profile);
  if (
    config.base_xp_scale === 1.0 &&
    config.streak_weight === 1.0 &&
    config.combo_weight === 1.0 &&
    config.consistency_weight === 1.0 &&
    config.momentum_weight === 1.0 &&
    config.perfect_day_bonus === 1.5 &&
    config.category_complete_bonus === 1.25
  ) {
    return calculateXp(input);
  }
  return calculateXpWithConfig(input, config);
}
