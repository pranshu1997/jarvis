import { findUserById, saveUser } from "./store";
import { applyDailyResetIfNeeded } from "@/lib/daily-reset";
import type { DashboardStats } from "@/types/database";

export async function loadAndPrepareUserState(userId: string) {
  const user = await findUserById(userId);
  if (!user) return null;
  const changed = applyDailyResetIfNeeded(user.game_state);
  if (changed) await saveUser(user);
  return user;
}

export async function persistUserState(
  userId: string,
  mutate: (state: DashboardStats) => void
) {
  const user = await findUserById(userId);
  if (!user) return null;
  mutate(user.game_state);
  await saveUser(user);
  return user.game_state;
}
