import type { DashboardStats, Quest } from "@/types/database";

export interface ExpiringQuest {
  quest: Quest;
  hoursLeft: number;
  expiresAt: string;
}

export function getExpiringQuests(state: DashboardStats, withinHours = 48): ExpiringQuest[] {
  const now = Date.now();
  const cutoff = now + withinHours * 3600_000;
  const results: ExpiringQuest[] = [];

  for (const quest of state.quests) {
    if (quest.status !== "active" || !quest.expires_at) continue;
    const exp = new Date(quest.expires_at).getTime();
    if (exp <= now || exp > cutoff) continue;
    results.push({
      quest,
      hoursLeft: Math.max(1, Math.round((exp - now) / 3600_000)),
      expiresAt: quest.expires_at,
    });
  }

  return results.sort((a, b) => a.hoursLeft - b.hoursLeft);
}

export function getUrgentQuestCount(state: DashboardStats): number {
  return getExpiringQuests(state, 24).length;
}
