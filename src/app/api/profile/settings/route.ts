import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { setPlayerSettings } from "@/lib/player-settings";

export async function PATCH(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();

  try {
    await withGameState((state) => {
      const patch: Record<string, unknown> = {};
      if (body.pinnedQuestId !== undefined) {
        patch.pinned_quest_id = body.pinnedQuestId;
      }
      if (body.weeklyFocus !== undefined) {
        patch.weekly_focus = body.weeklyFocus;
        patch.weekly_focus_week = new Date().toISOString().slice(0, 10);
      }
      if (body.notificationsEnabled !== undefined) {
        patch.notifications_enabled = !!body.notificationsEnabled;
      }
      if (body.missionBriefShown !== undefined) {
        patch.mission_brief_shown_date = body.missionBriefShown
          ? new Date().toISOString().slice(0, 10)
          : undefined;
      }
      if (body.habitReminders !== undefined) {
        patch.habit_reminders = body.habitReminders;
      }
      setPlayerSettings(state.profile, patch);
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
