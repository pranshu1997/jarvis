import { loadAndPrepareUserState } from "@/lib/local/mutations";
import { saveUser } from "@/lib/local/store";
import { getDemoModeState } from "@/lib/demo-session";
import { randomUUID } from "crypto";
import type { DashboardStats } from "@/types/database";

export async function migrateDemoToUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await loadAndPrepareUserState(userId);
  if (!user) return { ok: false, error: "User not found" };

  const demoState = getDemoModeState();
  const migrated: DashboardStats = {
    ...demoState,
    profile: {
      ...demoState.profile,
      id: userId,
      settings: {
        ...(demoState.profile.settings ?? {}),
        demo_migrated_at: new Date().toISOString(),
      },
    },
    habits: demoState.habits.map((h) => ({ ...h, id: randomUUID(), user_id: userId })),
    quests: demoState.quests.map((q) => ({ ...q, id: randomUUID(), user_id: userId })),
  };

  user.game_state = migrated;
  await saveUser(user);
  return { ok: true };
}
