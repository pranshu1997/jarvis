import { randomUUID } from "crypto";
import type { DashboardStats, Quest } from "@/types/database";
import {
  getExtended,
  patchExtended,
  type DungeonState,
} from "@/lib/player-settings-extended";
import { getHabitCategorySlug } from "@/lib/game-logic";

const BOSS_DAMAGE_PER_HABIT = 12;

export function getActiveDungeon(state: DashboardStats): DungeonState | null {
  return getExtended(state.profile).active_dungeon ?? null;
}

export function spawnDungeonFromQuest(state: DashboardStats, quest: Quest): void {
  if (quest.quest_type !== "dungeon" || quest.status !== "active") return;
  const ends = new Date();
  ends.setDate(ends.getDate() + 5);
  const hp = quest.target_count * BOSS_DAMAGE_PER_HABIT;
  patchExtended(state.profile, {
    active_dungeon: {
      quest_id: quest.id,
      boss_hp: hp,
      boss_hp_max: hp,
      ends_at: ends.toISOString(),
      title: quest.title,
    },
  });
}

export function damageDungeonBoss(
  state: DashboardStats,
  habitId: string
): { defeated: boolean; damage: number } {
  const dungeon = getActiveDungeon(state);
  if (!dungeon) return { defeated: false, damage: 0 };
  if (new Date(dungeon.ends_at) < new Date()) {
    patchExtended(state.profile, { active_dungeon: null });
    return { defeated: false, damage: 0 };
  }

  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return { defeated: false, damage: 0 };

  const meta = (state.quests.find((q) => q.id === dungeon.quest_id)?.metadata ?? {}) as {
    categories?: string[];
  };
  const cats = meta.categories as string[] | undefined;
  const cat = getHabitCategorySlug(habit);
  if (cats?.length && !cats.includes(cat)) return { defeated: false, damage: 0 };

  const damage = BOSS_DAMAGE_PER_HABIT;
  const nextHp = Math.max(0, dungeon.boss_hp - damage);
  const defeated = nextHp <= 0;

  if (defeated) {
    const quest = state.quests.find((q) => q.id === dungeon.quest_id);
    if (quest) {
      quest.status = "completed";
      quest.completed_at = new Date().toISOString();
      quest.current_count = quest.target_count;
    }
    const unlocked = { ...(getExtended(state.profile).achievements_unlocked ?? {}) };
    unlocked.dungeon_clear = { unlocked_at: new Date().toISOString() };
    patchExtended(state.profile, { active_dungeon: null, achievements_unlocked: unlocked });
  } else {
    patchExtended(state.profile, {
      active_dungeon: { ...dungeon, boss_hp: nextHp },
    });
  }

  return { defeated, damage };
}

export function ensureDungeonQuest(state: DashboardStats): void {
  if (getActiveDungeon(state)) return;
  const dungeon = state.quests.find(
    (q) => q.quest_type === "dungeon" && q.status === "active"
  );
  if (dungeon) spawnDungeonFromQuest(state, dungeon);
}

export function createWeeklyDungeon(state: DashboardStats): void {
  if (getActiveDungeon(state)) return;
  const id = randomUUID();
  const quest = {
    id,
    user_id: state.profile.id,
    slug: `dungeon_${Date.now().toString(36)}`,
    title: "Gate Breaker",
    description: "Defeat the boss by completing habits across all categories",
    quest_type: "dungeon" as const,
    status: "active" as const,
    target_count: 8,
    current_count: 0,
    xp_reward: 200,
    rank_required: null,
    category_id: null,
    is_system: false,
    expires_at: null,
    completed_at: null,
    metadata: { categories: ["physical", "mental", "awareness", "vitality"] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  state.quests.unshift(quest);
  spawnDungeonFromQuest(state, quest);
}
