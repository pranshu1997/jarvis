import { NextResponse } from "next/server";
import { getDemoDashboard } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isLocalAuthMode } from "@/lib/auth/config";
import { isDemoMode } from "@/lib/auth/demo";
import { getDemoModeState } from "@/lib/demo-session";
import { getLocalSessionUser } from "@/lib/auth/session";
import { loadAndPrepareUserState } from "@/lib/local/mutations";
import { bootstrapGameState } from "@/lib/local/bootstrap";
import { saveUser } from "@/lib/local/store";
import { syncAchievements } from "@/lib/achievements-db";
import { getActiveDungeon, ensureDungeonQuest } from "@/lib/dungeons";
import { getTodayReadiness } from "@/lib/readiness";
import { getShadowCoins } from "@/lib/player-settings-extended";
import { getAdaptiveSuggestions } from "@/lib/adaptive-habits";
import { generateWeeklyQuestsIfNeeded } from "@/lib/weekly-quest-gen";

export async function GET() {
  if (isLocalAuthMode()) {
    if (await isDemoMode()) {
      const state = getDemoModeState();
      const todayXp = state.recentXpEvents
        .filter((e) => e.created_at.startsWith(new Date().toISOString().slice(0, 10)))
        .reduce((s, e) => s + e.final_xp, 0);
      return NextResponse.json({ ...state, todayXpEarned: todayXp, demo: true });
    }

    const sessionUser = await getLocalSessionUser();
    if (sessionUser) {
      const user = await loadAndPrepareUserState(sessionUser.id);
      if (user) {
        const state = user.game_state;
        const boot = bootstrapGameState(state, user.id);
        const weeklyNew = generateWeeklyQuestsIfNeeded(state);
        ensureDungeonQuest(state);
        const achievements = syncAchievements(state);
        if (boot || weeklyNew) await saveUser(user);
        else {
          const unlocked = achievements.filter((a) => a.unlocked).length;
          if (unlocked > 0) await saveUser(user);
        }
        const todayXp = state.recentXpEvents
          .filter((e) => e.created_at.startsWith(new Date().toISOString().slice(0, 10)))
          .reduce((s, e) => s + e.final_xp, 0);
        return NextResponse.json({
          ...state,
          todayXpEarned: todayXp,
          meta: {
            achievements,
            readiness: getTodayReadiness(state),
            dungeon: getActiveDungeon(state),
            shadowCoins: getShadowCoins(state),
            adaptive: getAdaptiveSuggestions(state),
          },
        });
      }
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ...getDemoDashboard(), demo: true });
  }

  return NextResponse.json({ ...getDemoDashboard(), demo: true });
}
