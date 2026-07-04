import { getExtended } from "@/lib/player-settings-extended";
import type { Profile } from "@/types/database";

export type WebhookEvent =
  | "rank_up"
  | "perfect_day"
  | "dungeon_clear"
  | "level_up"
  | "achievement_unlock";

export async function fireWebhook(
  event: WebhookEvent,
  payload: Record<string, unknown>,
  profile: Profile
): Promise<boolean> {
  const url = getExtended(profile).webhook_url;
  if (!url?.trim()) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        at: new Date().toISOString(),
        player: {
          name: profile.display_name,
          rank: profile.rank,
          level: profile.player_level,
        },
        ...payload,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
