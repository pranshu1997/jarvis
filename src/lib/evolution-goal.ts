import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { DashboardStats, RankTier } from "@/types/database";

export interface EvolutionGoal {
  target_rank: RankTier;
  target_date: string;
  created_at: string;
}

const RANK_ORDER: RankTier[] = ["E", "D", "C", "B", "A", "S", "MONARCH"];

export function getEvolutionGoal(state: DashboardStats): EvolutionGoal | null {
  const g = getExtended(state.profile).evolution_goal;
  if (!g) return null;
  return { target_rank: g.target_rank as RankTier, target_date: g.target_date, created_at: g.created_at };
}

export function setEvolutionGoal(state: DashboardStats, targetRank: RankTier, targetDate: string): void {
  patchExtended(state.profile, {
    evolution_goal: { target_rank: targetRank, target_date: targetDate, created_at: new Date().toISOString() },
  });
}

export function getGoalProgress(state: DashboardStats) {
  const goal = getEvolutionGoal(state);
  if (!goal) return null;
  const currentIdx = RANK_ORDER.indexOf(state.profile.rank);
  const targetIdx = RANK_ORDER.indexOf(goal.target_rank);
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000));
  const percent = targetIdx > 0 ? Math.min(100, Math.round((currentIdx / targetIdx) * 100)) : 0;
  const onTrack = currentIdx >= targetIdx || daysLeft > 14;
  return { currentRank: state.profile.rank, targetRank: goal.target_rank, daysLeft, onTrack, percent };
}
