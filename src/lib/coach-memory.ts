import type { CoachChatMessage } from "@/lib/player-settings-extended";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { Profile } from "@/types/database";

const MAX_MESSAGES = 50;

export function getCoachHistory(profile: Profile): CoachChatMessage[] {
  return getExtended(profile).coach_chat_history ?? [];
}

export function appendCoachMessage(
  profile: Profile,
  role: "user" | "assistant",
  content: string
): void {
  const history = getCoachHistory(profile);
  const next: CoachChatMessage[] = [
    ...history,
    { role, content, at: new Date().toISOString() },
  ].slice(-MAX_MESSAGES);
  patchExtended(profile, { coach_chat_history: next });
}

export function clearCoachHistory(profile: Profile): void {
  patchExtended(profile, { coach_chat_history: [] });
}

export function coachHistoryForPrompt(profile: Profile, limit = 6): string {
  const recent = getCoachHistory(profile).slice(-limit);
  if (recent.length === 0) return "";
  return recent.map((m) => `${m.role}: ${m.content}`).join("\n");
}
