import { randomUUID } from "crypto";
import type { DashboardStats } from "@/types/database";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";

export interface SeasonalEventQuest {
  slug: string;
  title: string;
  description: string;
  target: number;
  xp: number;
}

export interface SeasonalEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  /** Inclusive start date YYYY-MM-DD */
  start: string;
  /** Inclusive end date YYYY-MM-DD */
  end: string;
  quests: SeasonalEventQuest[];
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "new_year_protocol",
    title: "New Year Protocol",
    subtitle: "Season: Renewal",
    description:
      "The new cycle begins. Prove your resolve in the first weeks of the year and claim season rewards.",
    start: "2026-01-01",
    end: "2026-01-14",
    quests: [
      {
        slug: "seasonal_nyr_streak",
        title: "Unbroken January",
        description: "Complete 7 consecutive perfect days",
        target: 7,
        xp: 300,
      },
      {
        slug: "seasonal_nyr_habits",
        title: "First Protocol",
        description: "Complete 50 habits during the event",
        target: 50,
        xp: 200,
      },
    ],
  },
  {
    id: "summer_grind",
    title: "Summer Grind",
    subtitle: "Season: Heat",
    description:
      "When the sun blazes, so does the grind. Push through 14 days of relentless execution.",
    start: "2026-06-01",
    end: "2026-06-30",
    quests: [
      {
        slug: "seasonal_summer_streak",
        title: "Heatwave Streak",
        description: "Maintain a 14-day streak on any habit",
        target: 14,
        xp: 400,
      },
      {
        slug: "seasonal_summer_perfect",
        title: "Solar Maximum",
        description: "Achieve 5 perfect days during June",
        target: 5,
        xp: 350,
      },
    ],
  },
  {
    id: "autumn_reflection",
    title: "Autumn Reflection",
    subtitle: "Season: Harvest",
    description:
      "The season of harvest demands you reap what you have sown. Complete weekly quests and count your gains.",
    start: "2026-09-22",
    end: "2026-10-05",
    quests: [
      {
        slug: "seasonal_autumn_quests",
        title: "Harvest Moon Quests",
        description: "Complete 5 weekly quests",
        target: 5,
        xp: 300,
      },
    ],
  },
  {
    id: "winter_discipline",
    title: "Winter Discipline",
    subtitle: "Season: Iron",
    description:
      "The coldest season demands the sharpest discipline. No excuses, no rest — rise every single day.",
    start: "2026-12-01",
    end: "2026-12-31",
    quests: [
      {
        slug: "seasonal_winter_streak",
        title: "Iron December",
        description: "Complete 20 consecutive daily habits",
        target: 20,
        xp: 500,
      },
      {
        slug: "seasonal_winter_perfect",
        title: "Frozen Throne",
        description: "Achieve perfect week during winter",
        target: 7,
        xp: 400,
      },
    ],
  },
];

export function getActiveSeasonalEvent(date = new Date()): SeasonalEvent | null {
  const today = date.toISOString().slice(0, 10);
  return SEASONAL_EVENTS.find((e) => e.start <= today && today <= e.end) ?? null;
}

/**
 * Spawn seasonal event quests into state if not already spawned this season.
 * Returns true if new quests were added.
 */
export function spawnSeasonalEventQuests(state: DashboardStats): boolean {
  const event = getActiveSeasonalEvent();
  if (!event) return false;

  const ext = getExtended(state.profile);
  const seen = ext.seasonal_events_seen ?? [];
  if (seen.includes(event.id)) return false;

  const now = new Date().toISOString();
  for (const eq of event.quests) {
    const alreadyExists = state.quests.some((q) => q.slug === eq.slug && q.status === "active");
    if (alreadyExists) continue;

    state.quests.push({
      id: randomUUID(),
      user_id: state.profile.id,
      slug: eq.slug,
      title: `[${event.subtitle}] ${eq.title}`,
      description: eq.description,
      quest_type: "weekly",
      status: "active",
      target_count: eq.target,
      current_count: 0,
      xp_reward: eq.xp,
      rank_required: null,
      category_id: null,
      is_system: true,
      expires_at: event.end,
      completed_at: null,
      metadata: { seasonal_event_id: event.id },
      created_at: now,
      updated_at: now,
    });
  }

  patchExtended(state.profile, {
    seasonal_events_seen: [...seen, event.id],
  });

  return true;
}
