import type { DashboardStats } from "@/types/database";
import {
  getExtended,
  patchExtended,
  type Routine,
} from "@/lib/player-settings-extended";

export const DEFAULT_ROUTINES: Omit<Routine, "id">[] = [
  {
    name: "Morning Protocol",
    habit_ids: [],
    bonus_xp: 25,
  },
];

export function getRoutines(state: DashboardStats): Routine[] {
  const existing = getExtended(state.profile).routines;
  if (existing?.length) return existing;

  const morningSlugs = ["meditate", "water_intake", "skincare", "read"];
  const ids = state.habits
    .filter((h) => morningSlugs.some((s) => h.slug.startsWith(s)))
    .map((h) => h.id);

  return [
    {
      id: "routine-morning",
      name: "Morning Protocol",
      habit_ids: ids,
      bonus_xp: 25,
    },
  ];
}

export function saveRoutines(state: DashboardStats, routines: Routine[]): void {
  patchExtended(state.profile, { routines });
}

export function completeRoutineChain(
  state: DashboardStats,
  routineId: string
): { bonusXp: number; completed: number } | null {
  const routines = getRoutines(state);
  const routine = routines.find((r) => r.id === routineId);
  if (!routine) return null;

  let completed = 0;
  for (const hid of routine.habit_ids) {
    const h = state.habits.find((x) => x.id === hid);
    if (h?.completed_today) completed++;
  }

  if (completed < routine.habit_ids.length) return null;

  const unlocked = { ...(getExtended(state.profile).achievements_unlocked ?? {}) };
  unlocked.routine_master = { unlocked_at: new Date().toISOString() };
  patchExtended(state.profile, { achievements_unlocked: unlocked });

  return { bonusXp: routine.bonus_xp, completed };
}
