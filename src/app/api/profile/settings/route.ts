import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { setPlayerSettings } from "@/lib/player-settings";
import { patchExtended } from "@/lib/player-settings-extended";

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
        patchExtended(state.profile, { habit_reminders: body.habitReminders });
      }
      if (body.onboardingCompleted !== undefined) {
        patchExtended(state.profile, { onboarding_completed: !!body.onboardingCompleted });
      }
      if (body.reducedMotion !== undefined) {
        patchExtended(state.profile, { reduced_motion: !!body.reducedMotion });
      }
      if (body.profile_avatar !== undefined || body.profile_title !== undefined || body.theme_mode !== undefined || body.sound_theme !== undefined || body.webhook_url !== undefined) {
        patchExtended(state.profile, {
          ...(body.profile_avatar !== undefined && { profile_avatar: body.profile_avatar }),
          ...(body.profile_title !== undefined && { profile_title: body.profile_title }),
          ...(body.theme_mode !== undefined && { theme_mode: body.theme_mode }),
          ...(body.sound_theme !== undefined && { sound_theme: body.sound_theme }),
          ...(body.webhook_url !== undefined && { webhook_url: body.webhook_url }),
        });
      }
      if (body.todayIntention !== undefined) {
        patchExtended(state.profile, { today_intention: body.todayIntention });
      }
      if (body.compactMode !== undefined) {
        patchExtended(state.profile, { compact_mode: !!body.compactMode });
      }
      if (body.weeklyFocusCategory !== undefined) {
        patchExtended(state.profile, { weekly_focus_category: body.weeklyFocusCategory || undefined });
      }
      if (body.morningMode !== undefined) {
        patchExtended(state.profile, { morning_mode: !!body.morningMode });
      }
      if (body.collapsedSections !== undefined) {
        patchExtended(state.profile, { collapsed_sections: body.collapsedSections });
      }
      if (body.xpFormulaConfig !== undefined) {
        patchExtended(state.profile, { xp_formula_config: body.xpFormulaConfig });
      }
      if (Object.keys(patch).length) {
        setPlayerSettings(state.profile, patch);
      }
      patchExtended(state.profile, { last_synced_at: new Date().toISOString() });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
