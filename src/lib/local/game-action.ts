import { isDemoMode } from "@/lib/auth/demo";
import { getDemoModeState } from "@/lib/demo-session";
import { getLocalSessionUser } from "@/lib/auth/session";
import { persistUserState } from "@/lib/local/mutations";
import type { DashboardStats } from "@/types/database";

export class GameAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "GameAuthError";
  }
}

/** Run a mutation on the active game state (logged-in user or demo). */
export async function withGameState<T>(
  fn: (state: DashboardStats) => T
): Promise<{ value: T; userId: string; demo: boolean }> {
  if (await isDemoMode()) {
    const state = getDemoModeState();
    const value = fn(state);
    return { value, userId: "demo-user", demo: true };
  }

  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    throw new GameAuthError();
  }

  let value!: T;
  await persistUserState(sessionUser.id, (state) => {
    value = fn(state);
  });

  return { value, userId: sessionUser.id, demo: false };
}
