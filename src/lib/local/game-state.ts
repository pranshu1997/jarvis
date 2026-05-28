import { randomUUID } from "crypto";
import {
  DEMO_CATEGORIES,
  DEMO_HABITS,
  DEMO_QUESTS,
  DEMO_SUPPLEMENTS,
} from "@/lib/demo-data";
import {
  buildSeedSkills,
  buildSeedSports,
  buildSeedExercises,
} from "@/lib/seed-workout-system";
import { rollupSkillTree } from "@/lib/workout-progression";
import type { DashboardStats, Profile } from "@/types/database";
import { todayISO } from "@/lib/utils";

export function createInitialGameState(
  userId: string,
  displayName: string
): DashboardStats {
  const profile: Profile = {
    id: userId,
    display_name: displayName,
    avatar_url: null,
    player_level: 1,
    total_xp: 0,
    power_score: 10,
    discipline_score: 10,
    momentum_score: 10,
    consistency_score: 10,
    rank: "E",
    is_guest: false,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const remapId = (prefix: string) => `${prefix}-${userId.slice(0, 8)}`;

  const skills = buildSeedSkills(remapId).map((s) => ({
    ...s,
    user_id: userId,
    total_xp: 0,
    level: 1,
    rank: "E" as const,
  }));

  const sports = buildSeedSports(remapId).map((s) => ({
    ...s,
    user_id: userId,
    total_xp: 0,
    level: 1,
    sessions_count: 0,
    rank: "E" as const,
    played_today: false,
  }));

  const exercises = buildSeedExercises(remapId, skills).map((e) => ({
    ...e,
    user_id: userId,
    total_xp: 0,
    level: 1,
    personal_record: null,
    frequency_score: 0,
  }));

  rollupSkillTree(skills);

  return {
    profile,
    categories: DEMO_CATEGORIES.map((c) => ({
      ...c,
      id: remapId(c.id),
      user_id: userId,
    })),
    habits: DEMO_HABITS.map((h) => ({
      ...h,
      id: remapId(h.id),
      user_id: userId,
      completed_today: false,
    })),
    supplements: DEMO_SUPPLEMENTS.map((s) => ({
      ...s,
      id: remapId(s.id),
      user_id: userId,
      taken_today: false,
    })),
    quests: DEMO_QUESTS.map((q) => ({
      ...q,
      id: remapId(q.id),
      user_id: userId,
      current_count: 0,
      status: "active" as const,
    })),
    dailyCompletion: {
      id: randomUUID(),
      user_id: userId,
      completion_date: todayISO(),
      physical_complete: false,
      mental_complete: false,
      awareness_complete: false,
      vitality_complete: false,
      perfect_day: false,
      total_habits: DEMO_HABITS.length,
      completed_habits: 0,
      total_xp: 0,
      metadata: {},
      created_at: new Date().toISOString(),
    },
    recentXpEvents: [],
    skills,
    sports,
    exercises,
    workoutSessions: [],
    workoutLogs: [],
    todayXpEarned: 0,
  };
}
