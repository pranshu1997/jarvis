import { addShadowCoins, getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { DashboardStats, RankTier } from "@/types/database";

export interface RankPerk {
  id: string;
  rank: RankTier;
  title: string;
  description: string;
  coin_bonus?: number;
  extra_shield?: number;
}

export const RANK_PERKS: RankPerk[] = [
  { id: "perk-d-shield", rank: "D", title: "Novice Shield", description: "+1 streak shield", extra_shield: 1 },
  { id: "perk-c-coins", rank: "C", title: "Coin Finder", description: "+10% shadow coin earnings", coin_bonus: 0.1 },
  { id: "perk-b-shield", rank: "B", title: "Veteran Shield", description: "+1 streak shield", extra_shield: 1 },
  { id: "perk-a-coins", rank: "A", title: "Treasure Hunter", description: "+15% shadow coin earnings", coin_bonus: 0.15 },
  { id: "perk-s-shield", rank: "S", title: "Elite Guard", description: "+2 streak shields", extra_shield: 2 },
  { id: "perk-monarch", rank: "MONARCH", title: "Monarch's Bounty", description: "+500 coins + 25% coin bonus", coin_bonus: 0.25 },
];

const RANK_ORDER: RankTier[] = ["E", "D", "C", "B", "A", "S", "MONARCH"];

function rankIndex(rank: RankTier): number {
  return RANK_ORDER.indexOf(rank);
}

export function getEligiblePerks(state: DashboardStats): RankPerk[] {
  const playerRank = state.profile.rank;
  const claimed = getExtended(state.profile).rank_perks_claimed ?? [];
  return RANK_PERKS.filter(
    (p) => rankIndex(playerRank) >= rankIndex(p.rank) && !claimed.includes(p.id)
  );
}

export function claimRankPerk(state: DashboardStats, perkId: string): boolean {
  const perk = RANK_PERKS.find((p) => p.id === perkId);
  if (!perk) return false;

  const claimed = getExtended(state.profile).rank_perks_claimed ?? [];
  if (claimed.includes(perkId)) return false;
  if (rankIndex(state.profile.rank) < rankIndex(perk.rank)) return false;

  if (perk.extra_shield) {
    const settings = state.profile.settings ?? {};
    const shields = (settings.streak_shields as number) ?? 0;
    state.profile.settings = { ...settings, streak_shields: shields + perk.extra_shield };
  }

  if (perk.id === "perk-monarch") {
    addShadowCoins(state, 500, `Rank perk: ${perk.title}`);
  }

  patchExtended(state.profile, { rank_perks_claimed: [...claimed, perkId] });
  return true;
}

export function getCoinBonusMultiplier(state: DashboardStats): number {
  const claimed = getExtended(state.profile).rank_perks_claimed ?? [];
  let bonus = 0;
  for (const perk of RANK_PERKS) {
    if (claimed.includes(perk.id) && perk.coin_bonus) bonus += perk.coin_bonus;
  }
  return 1 + bonus;
}
