import type { Exercise, Skill, Sport, WorkoutLogEntry, WorkoutSession } from "@/types/database";
import { rankFromLevel, levelFromXp } from "@/lib/xp-engine";

function skill(
  id: string,
  slug: string,
  name: string,
  skillType: Skill["skill_type"],
  parentId: string | null,
  icon: string,
  color: string,
  totalXp = 0,
  sortOrder = 0
): Skill {
  const level = levelFromXp(totalXp);
  return {
    id,
    user_id: null,
    parent_id: parentId,
    slug,
    name,
    description: null,
    icon,
    color,
    skill_type: skillType,
    base_xp: 15,
    level,
    total_xp: totalXp,
    current_streak: 0,
    longest_streak: 0,
    rank: rankFromLevel(level),
    is_system: true,
    metadata: { sort_order: sortOrder },
    created_at: "",
    updated_at: "",
  };
}

export const SEED_SKILL_IDS = {
  workout: "skill-workout",
  strength: "skill-strength",
  sportsBranch: "skill-sports-branch",
  endurance: "skill-endurance",
  flexibility: "skill-flexibility",
  mobility: "skill-mobility",
  fighting: "skill-fighting",
  chest: "skill-chest",
  back: "skill-back",
  legs: "skill-legs",
  shoulders: "skill-shoulders",
  arms: "skill-arms",
  core: "skill-core",
} as const;

export function buildSeedSkills(remapId: (id: string) => string): Skill[] {
  const w = remapId(SEED_SKILL_IDS.workout);
  const st = remapId(SEED_SKILL_IDS.strength);
  const sb = remapId(SEED_SKILL_IDS.sportsBranch);
  const en = remapId(SEED_SKILL_IDS.endurance);
  const fl = remapId(SEED_SKILL_IDS.flexibility);
  const mo = remapId(SEED_SKILL_IDS.mobility);
  const fi = remapId(SEED_SKILL_IDS.fighting);

  return [
    skill(w, "workout", "Workout", "workout_root", null, "flame", "#00d4ff", 800, 0),
    skill(st, "strength", "Strength", "workout_branch", w, "shield", "#3b82f6", 1240, 1),
    skill(sb, "sports_branch", "Sports", "workout_branch", w, "trophy", "#f59e0b", 420, 2),
    skill(en, "endurance", "Endurance", "workout_branch", w, "wind", "#06b6d4", 310, 3),
    skill(fl, "flexibility", "Flexibility", "workout_branch", w, "stretch", "#8b5cf6", 180, 4),
    skill(mo, "mobility", "Mobility", "workout_branch", w, "move", "#14b8a6", 220, 5),
    skill(fi, "fighting", "Fighting", "workout_branch", w, "swords", "#ef4444", 350, 6),
    skill(remapId(SEED_SKILL_IDS.chest), "chest", "Chest", "muscle_group", st, "target", "#3b82f6", 400, 10),
    skill(remapId(SEED_SKILL_IDS.back), "back", "Back", "muscle_group", st, "target", "#3b82f6", 520, 11),
    skill(remapId(SEED_SKILL_IDS.legs), "legs", "Legs", "muscle_group", st, "target", "#3b82f6", 480, 12),
    skill(remapId(SEED_SKILL_IDS.shoulders), "shoulders", "Shoulders", "muscle_group", st, "target", "#3b82f6", 180, 13),
    skill(remapId(SEED_SKILL_IDS.arms), "arms", "Arms", "muscle_group", st, "target", "#3b82f6", 120, 14),
    skill(remapId(SEED_SKILL_IDS.core), "core_muscle", "Core", "muscle_group", st, "target", "#3b82f6", 95, 15),
  ];
}

export function buildSeedSports(remapId: (id: string) => string): Sport[] {
  const templates = [
    { slug: "overall", name: "Overall Sports", icon: "trophy", color: "#f59e0b", total_xp: 280, sessions_count: 24, current_streak: 2 },
    { slug: "basketball", name: "Basketball", icon: "trophy", color: "#f59e0b", total_xp: 120, sessions_count: 8, current_streak: 0 },
    { slug: "running", name: "Running", icon: "wind", color: "#06b6d4", total_xp: 340, sessions_count: 18, current_streak: 4 },
    { slug: "swimming", name: "Swimming", icon: "droplets", color: "#06b6d4", total_xp: 90, sessions_count: 5, current_streak: 0 },
    { slug: "tennis", name: "Tennis", icon: "target", color: "#22c55e", total_xp: 45, sessions_count: 3, current_streak: 0 },
    { slug: "bjj", name: "BJJ", icon: "swords", color: "#ef4444", total_xp: 210, sessions_count: 9, current_streak: 1 },
    { slug: "boxing", name: "Boxing", icon: "swords", color: "#ef4444", total_xp: 75, sessions_count: 4, current_streak: 0 },
  ];

  return templates.map((t) => {
    const level = levelFromXp(t.total_xp);
    return {
      id: remapId(`sport-${t.slug}`),
      user_id: null,
      slug: t.slug,
      name: t.name,
      icon: t.icon,
      color: t.color,
      base_xp: 22,
      level,
      total_xp: t.total_xp,
      current_streak: t.current_streak,
      longest_streak: t.current_streak + 5,
      sessions_count: t.sessions_count,
      rank: rankFromLevel(level),
      is_system: true,
      is_active: true,
      metadata: {},
      created_at: "",
      updated_at: "",
      played_today: false,
    };
  });
}

const MUSCLE_SLUG: Record<string, string> = {
  chest: "chest",
  back: "back",
  legs: "legs",
  shoulders: "shoulders",
  arms: "arms",
  core_muscle: "core_muscle",
};

export function buildSeedExercises(
  remapId: (id: string) => string,
  skills: Skill[]
): Exercise[] {
  const skillIdBySlug = Object.fromEntries(skills.map((s) => [s.slug, s.id]));

  const defs = [
    { slug: "bench_press", name: "Bench Press", muscle_group: "chest", base_xp: 25, total_xp: 400, pr: 100 },
    { slug: "incline_bench", name: "Incline Bench", muscle_group: "chest", base_xp: 20, total_xp: 150, pr: 80 },
    { slug: "squat", name: "Squat", muscle_group: "legs", base_xp: 30, total_xp: 520, pr: 140 },
    { slug: "leg_press", name: "Leg Press", muscle_group: "legs", base_xp: 20, total_xp: 150, pr: 200 },
    { slug: "deadlift", name: "Deadlift", muscle_group: "back", base_xp: 35, total_xp: 680, pr: 180 },
    { slug: "pullups", name: "Pullups", muscle_group: "back", base_xp: 20, total_xp: 220, pr: 15, unit: "reps" },
    { slug: "barbell_row", name: "Barbell Row", muscle_group: "back", base_xp: 20, total_xp: 140, pr: 90 },
    { slug: "shoulder_press", name: "Shoulder Press", muscle_group: "shoulders", base_xp: 20, total_xp: 180, pr: 60 },
    { slug: "bicep_curl", name: "Bicep Curl", muscle_group: "arms", base_xp: 15, total_xp: 80, pr: 35 },
    { slug: "tricep_pushdown", name: "Tricep Pushdown", muscle_group: "arms", base_xp: 15, total_xp: 70, pr: 40 },
    { slug: "plank", name: "Plank", muscle_group: "core_muscle", base_xp: 15, total_xp: 95, pr: 120, unit: "sec" },
  ];

  return defs.map((d) => {
    const mgSlug = MUSCLE_SLUG[d.muscle_group] ?? d.muscle_group;
    const level = levelFromXp(d.total_xp);
    return {
      id: remapId(`ex-${d.slug}`),
      user_id: null,
      category_id: null,
      skill_id: skillIdBySlug[mgSlug] ?? null,
      slug: d.slug,
      name: d.name,
      muscle_group: d.muscle_group,
      base_xp: d.base_xp,
      level,
      total_xp: d.total_xp,
      personal_record: d.pr,
      pr_unit: (d as { unit?: string }).unit ?? "kg",
      frequency_score: 0,
      is_system: true,
      metadata: { muscle_group: d.muscle_group },
      created_at: "",
      updated_at: "",
    };
  });
}

export function ensureWorkoutSystem(state: {
  skills?: Skill[];
  sports?: Sport[];
  exercises?: Exercise[];
  workoutSessions?: WorkoutSession[];
  workoutLogs?: WorkoutLogEntry[];
  userId?: string;
}): boolean {
  const remapId = (id: string) =>
    state.userId ? `${id}-${state.userId.slice(0, 8)}` : id;

  let changed = false;

  if (!state.skills?.length) {
    changed = true;
    state.skills = buildSeedSkills(remapId).map((s) => ({
      ...s,
      user_id: state.userId ?? null,
    }));
  }
  if (!state.sports?.length) {
    changed = true;
    state.sports = buildSeedSports(remapId).map((s) => ({
      ...s,
      user_id: state.userId ?? null,
    }));
  }
  if (!state.exercises?.length) {
    changed = true;
    state.exercises = buildSeedExercises(remapId, state.skills).map((e) => ({
      ...e,
      user_id: state.userId ?? null,
    }));
  }
  if (!state.workoutSessions) {
    state.workoutSessions = [];
    changed = true;
  }
  if (!state.workoutLogs) {
    state.workoutLogs = [];
    changed = true;
  }
  return changed;
}
