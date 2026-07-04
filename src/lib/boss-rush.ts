import { addShadowCoins, getExtended, patchExtended } from "@/lib/player-settings-extended";
import { ensureDungeonQuest, getActiveDungeon } from "@/lib/dungeons";
import type { DashboardStats } from "@/types/database";

const RUSH_PHASES = 3;

export function startBossRush(state: DashboardStats): { ok: boolean; error?: string } {
  const ext = getExtended(state.profile);
  if (ext.boss_rush_active) return { ok: false, error: "Boss rush already active" };
  if (getActiveDungeon(state)) return { ok: false, error: "Finish current dungeon first" };

  ensureDungeonQuest(state);
  patchExtended(state.profile, {
    boss_rush_active: { phase: 1, started_at: new Date().toISOString() },
  });
  return { ok: true };
}

export function advanceBossRush(state: DashboardStats): { completed: boolean; phase: number } {
  const ext = getExtended(state.profile);
  const rush = ext.boss_rush_active;
  if (!rush) return { completed: false, phase: 0 };

  const dungeon = getActiveDungeon(state);
  if (dungeon && dungeon.boss_hp > 0) {
    return { completed: false, phase: rush.phase };
  }

  const reward = 25 * rush.phase;
  addShadowCoins(state, reward, `Boss Rush phase ${rush.phase}`);

  if (rush.phase >= RUSH_PHASES) {
    const wins = (ext.boss_rush_wins ?? 0) + 1;
    patchExtended(state.profile, {
      boss_rush_active: null,
      boss_rush_wins: wins,
    });
    addShadowCoins(state, 100, "Boss Rush complete!");
    return { completed: true, phase: rush.phase };
  }

  ensureDungeonQuest(state);
  patchExtended(state.profile, {
    boss_rush_active: { phase: rush.phase + 1, started_at: new Date().toISOString() },
  });
  return { completed: false, phase: rush.phase + 1 };
}

export function getBossRushState(state: DashboardStats) {
  const ext = getExtended(state.profile);
  return {
    active: ext.boss_rush_active ?? null,
    totalWins: ext.boss_rush_wins ?? 0,
    maxPhases: RUSH_PHASES,
  };
}
