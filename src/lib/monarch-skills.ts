import { addShadowCoins, getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { DashboardStats } from "@/types/database";

export interface MonarchSkill {
  id: string;
  title: string;
  description: string;
  cost: number;
  max_level: number;
  effect: "xp_boost" | "coin_boost" | "combo_boost" | "shield_regen";
  value_per_level: number;
}

export const MONARCH_SKILLS: MonarchSkill[] = [
  { id: "skill-xp", title: "XP Amplifier", description: "+2% XP per level", cost: 100, max_level: 5, effect: "xp_boost", value_per_level: 0.02 },
  { id: "skill-coin", title: "Shadow Harvest", description: "+3% coins per level", cost: 150, max_level: 5, effect: "coin_boost", value_per_level: 0.03 },
  { id: "skill-combo", title: "Combo Mastery", description: "+5% combo XP per level", cost: 120, max_level: 3, effect: "combo_boost", value_per_level: 0.05 },
  { id: "skill-shield", title: "Shield Regen", description: "Regain 1 shield every 7 perfect days", cost: 200, max_level: 1, effect: "shield_regen", value_per_level: 1 },
];

export function getSkillLevels(state: DashboardStats): Record<string, number> {
  const upgrades = getExtended(state.profile).skill_tree_upgrades ?? [];
  const levels: Record<string, number> = {};
  for (const u of upgrades) {
    levels[u.skill_id] = (levels[u.skill_id] ?? 0) + 1;
  }
  return levels;
}

export function purchaseSkill(state: DashboardStats, skillId: string): { ok: boolean; error?: string } {
  const skill = MONARCH_SKILLS.find((s) => s.id === skillId);
  if (!skill) return { ok: false, error: "Unknown skill" };

  const levels = getSkillLevels(state);
  const current = levels[skillId] ?? 0;
  if (current >= skill.max_level) return { ok: false, error: "Max level reached" };

  const coins = getExtended(state.profile).shadow_coins ?? 0;
  const cost = skill.cost * (current + 1);
  if (coins < cost) return { ok: false, error: "Not enough shadow coins" };

  addShadowCoins(state, -cost, `Skill: ${skill.title}`);
  const upgrades = getExtended(state.profile).skill_tree_upgrades ?? [];
  patchExtended(state.profile, {
    skill_tree_upgrades: [...upgrades, { skill_id: skillId, purchased_at: new Date().toISOString() }],
  });
  return { ok: true };
}

export function getSkillMultiplier(state: DashboardStats, effect: MonarchSkill["effect"]): number {
  const levels = getSkillLevels(state);
  let bonus = 0;
  for (const skill of MONARCH_SKILLS) {
    if (skill.effect === effect) {
      bonus += (levels[skill.id] ?? 0) * skill.value_per_level;
    }
  }
  return 1 + bonus;
}
