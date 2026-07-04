import type { DashboardStats } from "@/types/database";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { getWeightLogs } from "@/lib/player-settings";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  check: (s: DashboardStats) => boolean;
}

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
  { id: "awakened", title: "Awakened", description: "Reach player level 5", icon: "zap", rarity: "common", check: (s) => s.profile.player_level >= 5 },
  { id: "hunter_10", title: "Double Digits", description: "Reach player level 10", icon: "zap", rarity: "common", check: (s) => s.profile.player_level >= 10 },
  { id: "hunter_25", title: "Veteran Hunter", description: "Reach player level 25", icon: "zap", rarity: "rare", check: (s) => s.profile.player_level >= 25 },
  { id: "rank_d", title: "D-Rank", description: "Achieve D rank", icon: "shield", rarity: "common", check: (s) => rankAtLeast(s, "D") },
  { id: "rank_c", title: "C-Rank Hunter", description: "Achieve C rank or higher", icon: "shield", rarity: "common", check: (s) => rankAtLeast(s, "C") },
  { id: "rank_b", title: "B-Rank Hunter", description: "Achieve B rank", icon: "shield", rarity: "rare", check: (s) => rankAtLeast(s, "B") },
  { id: "rank_a", title: "A-Rank Hunter", description: "Achieve A rank", icon: "shield", rarity: "epic", check: (s) => rankAtLeast(s, "A") },
  { id: "rank_s", title: "S-Rank Hunter", description: "Achieve S rank", icon: "shield", rarity: "epic", check: (s) => rankAtLeast(s, "S") },
  { id: "national", title: "National Level", description: "Achieve National rank", icon: "shield", rarity: "legendary", check: (s) => rankAtLeast(s, "NATIONAL") },
  { id: "monarch", title: "Shadow Monarch", description: "Achieve Monarch rank", icon: "crown", rarity: "legendary", check: (s) => s.profile.rank === "MONARCH" },
  { id: "streak_3", title: "Ignition", description: "3-day habit streak", icon: "flame", rarity: "common", check: (s) => maxStreak(s) >= 3 },
  { id: "streak_7", title: "Streak Ignition", description: "7-day habit streak", icon: "flame", rarity: "common", check: (s) => maxStreak(s) >= 7 },
  { id: "streak_14", title: "Unbroken Flame", description: "14-day habit streak", icon: "flame", rarity: "rare", check: (s) => maxStreak(s) >= 14 },
  { id: "streak_30", title: "Iron Will", description: "30-day habit streak", icon: "flame", rarity: "epic", check: (s) => maxStreak(s) >= 30 },
  { id: "streak_60", title: "Eternal Flame", description: "60-day habit streak", icon: "flame", rarity: "legendary", check: (s) => maxStreak(s) >= 60 },
  { id: "perfect_day", title: "Perfect Day", description: "Complete every habit in one day", icon: "star", rarity: "common", check: (s) => !!s.dailyCompletion?.perfect_day },
  { id: "perfect_week", title: "Perfect Week", description: "5+ perfect days this week", icon: "trophy", rarity: "rare", check: (s) => perfectDaysWeek(s) >= 5 },
  { id: "physical_5", title: "Body Forged", description: "Physical category level 5+", icon: "dumbbell", rarity: "common", check: (s) => catLevel(s, "physical") >= 5 },
  { id: "physical_10", title: "Physical Dominance", description: "Physical category level 10+", icon: "dumbbell", rarity: "rare", check: (s) => catLevel(s, "physical") >= 10 },
  { id: "mental_10", title: "Mind Palace", description: "Mental category level 10+", icon: "brain", rarity: "rare", check: (s) => catLevel(s, "mental") >= 10 },
  { id: "awareness_10", title: "Third Eye", description: "Awareness category level 10+", icon: "eye", rarity: "rare", check: (s) => catLevel(s, "awareness") >= 10 },
  { id: "vitality_10", title: "Vitality Core", description: "Vitality category level 10+", icon: "heart", rarity: "rare", check: (s) => catLevel(s, "vitality") >= 10 },
  { id: "pr_hunter", title: "PR Hunter", description: "Set a personal record", icon: "target", rarity: "common", check: (s) => s.workoutLogs?.some((l) => l.is_pr) ?? false },
  { id: "pr_5", title: "Record Breaker", description: "5 PRs logged", icon: "target", rarity: "rare", check: (s) => (s.workoutLogs?.filter((l) => l.is_pr).length ?? 0) >= 5 },
  { id: "workout_10", title: "Iron Temple", description: "10 workout sessions", icon: "dumbbell", rarity: "common", check: (s) => (s.workoutSessions?.length ?? 0) >= 10 },
  { id: "workout_50", title: "Gym Rat", description: "50 workout sessions", icon: "dumbbell", rarity: "epic", check: (s) => (s.workoutSessions?.length ?? 0) >= 50 },
  { id: "sport_log", title: "Athlete", description: "Log a sports session", icon: "trophy", rarity: "common", check: (s) => s.sports.some((sp) => sp.sessions_count > 0) },
  { id: "supplement_stack", title: "Stack Master", description: "All supplements today", icon: "sparkles", rarity: "common", check: (s) => {
    const a = s.supplements.filter((x) => x.is_active);
    return a.length > 0 && a.every((x) => x.taken_today);
  }},
  { id: "combo_5", title: "Flow State", description: "5× combo in one day", icon: "zap", rarity: "common", check: (s) => ((s.dailyCompletion?.metadata?.combo_count as number) ?? 0) >= 5 },
  { id: "combo_10", title: "Overdrive", description: "10× combo in one day", icon: "zap", rarity: "rare", check: (s) => ((s.dailyCompletion?.metadata?.combo_count as number) ?? 0) >= 10 },
  { id: "phoenix", title: "Phoenix Rising", description: "Recover a broken streak via Phoenix", icon: "bird", rarity: "rare", check: (s) => (getExtended(s.profile).resilience_score ?? 0) >= 1 },
  { id: "resilience_5", title: "Unbreakable", description: "Resilience score 5+", icon: "shield", rarity: "epic", check: (s) => (getExtended(s.profile).resilience_score ?? 0) >= 5 },
  { id: "dungeon_clear", title: "Dungeon Cleared", description: "Defeat a dungeon boss", icon: "swords", rarity: "rare", check: (s) => getExtended(s.profile).achievements_unlocked?.dungeon_clear != null },
  { id: "routine_master", title: "Protocol Master", description: "Complete a full routine chain", icon: "link", rarity: "common", check: (s) => !!getExtended(s.profile).achievements_unlocked?.routine_master },
  { id: "shop_spend", title: "Rewarded Self", description: "Purchase from Shadow Shop", icon: "coins", rarity: "common", check: (s) => !!getExtended(s.profile).achievements_unlocked?.shop_spend },
  { id: "readiness_week", title: "Body Aware", description: "Log readiness 7 days in a row", icon: "activity", rarity: "rare", check: (s) => (getExtended(s.profile).readiness_log?.length ?? 0) >= 7 },
  { id: "weight_30", title: "Scale Discipline", description: "Log weight 30 times", icon: "scale", rarity: "rare", check: (s) => getWeightLogs(s).length >= 30 },
  { id: "xp_1000_day", title: "XP Surge", description: "Earn 1000+ XP in one day", icon: "zap", rarity: "epic", check: (s) => (s.todayXpEarned ?? s.dailyCompletion?.total_xp ?? 0) >= 1000 },
  { id: "custom_habit", title: "Architect", description: "Create a custom habit", icon: "plus", rarity: "common", check: (s) => s.habits.some((h) => !h.is_system) },
  { id: "all_categories", title: "Balanced Hunter", description: "All 4 categories level 3+", icon: "grid", rarity: "rare", check: (s) => s.categories.every((c) => c.level >= 3) },
  { id: "coins_500", title: "Shadow Hoard", description: "Hold 500 Shadow Coins", icon: "coins", rarity: "epic", check: (s) => (getExtended(s.profile).shadow_coins ?? 0) >= 500 },
];

const RANK_ORDER = ["E", "D", "C", "B", "A", "S", "NATIONAL", "MONARCH"];

function rankAtLeast(s: DashboardStats, min: string) {
  return RANK_ORDER.indexOf(s.profile.rank) >= RANK_ORDER.indexOf(min);
}
function maxStreak(s: DashboardStats) {
  return Math.max(0, ...s.habits.map((h) => h.longest_streak));
}
function perfectDaysWeek(s: DashboardStats) {
  return ((s.dailyCompletion?.metadata?.perfect_days_week as string[]) ?? []).length;
}
function catLevel(s: DashboardStats, slug: string) {
  return s.categories.find((c) => c.slug === slug)?.level ?? 0;
}

export interface AchievementView {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlocked_at: string | null;
}

export type SyncAchievementsResult = {
  achievements: AchievementView[];
  changed: boolean;
};

export function syncAchievements(state: DashboardStats): SyncAchievementsResult {
  const unlocked = { ...(getExtended(state.profile).achievements_unlocked ?? {}) };
  const now = new Date().toISOString();
  let changed = false;

  for (const def of ACHIEVEMENT_CATALOG) {
    if (!unlocked[def.id] && def.check(state)) {
      unlocked[def.id] = { unlocked_at: now };
      changed = true;
    }
  }

  if (changed) patchExtended(state.profile, { achievements_unlocked: unlocked });

  const achievements = ACHIEVEMENT_CATALOG.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    rarity: def.rarity,
    unlocked: !!unlocked[def.id],
    unlocked_at: unlocked[def.id]?.unlocked_at ?? null,
  }));

  return { achievements, changed };
}

/** Legacy panel compatibility */
export function getAchievementsForPanel(state: DashboardStats) {
  return syncAchievements(state).achievements;
}
