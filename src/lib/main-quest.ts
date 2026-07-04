import type { DashboardStats } from "@/types/database";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { isPerfectWeekActive } from "@/lib/game-logic";

export interface MainQuestRequirement {
  level?: number;
  habit_streak?: number;
  perfect_days?: number;
  quests_completed?: number;
  rank?: string;
  boss_rush_wins?: number;
}

export interface MainQuestChapter {
  chapter: number;
  title: string;
  tagline: string;
  description: string;
  objective: string;
  xp_reward: number;
  coin_reward: number;
  requirement: MainQuestRequirement;
}

export const MAIN_QUEST_CHAPTERS: MainQuestChapter[] = [
  {
    chapter: 1,
    title: "The Awakening",
    tagline: "Chapter I",
    description:
      "You have opened your eyes to the system. The path begins with a single step — establish your first habit and feel the momentum build.",
    objective: "Reach Hunter Level 3",
    xp_reward: 200,
    coin_reward: 50,
    requirement: { level: 3 },
  },
  {
    chapter: 2,
    title: "The Protocol",
    tagline: "Chapter II",
    description:
      "Discipline is not born, it is forged. Build a streak of 7 days to prove your dedication to the system.",
    objective: "Maintain a 7-day habit streak",
    xp_reward: 400,
    coin_reward: 100,
    requirement: { habit_streak: 7 },
  },
  {
    chapter: 3,
    title: "The Crucible",
    tagline: "Chapter III",
    description:
      "The hunter who endures the forge emerges stronger. Achieve 3 perfect days — every habit completed without exception.",
    objective: "Complete 3 perfect days",
    xp_reward: 600,
    coin_reward: 150,
    requirement: { perfect_days: 3 },
  },
  {
    chapter: 4,
    title: "The Gate",
    tagline: "Chapter IV",
    description:
      "The Gate stands between the ordinary and the elite. Complete 10 quests to prove you are ready to pass through.",
    objective: "Complete 10 quests",
    xp_reward: 800,
    coin_reward: 200,
    requirement: { quests_completed: 10 },
  },
  {
    chapter: 5,
    title: "Monarch Rising",
    tagline: "Chapter V",
    description:
      "You have come far, hunter. The path to Monarch-tier begins here. Reach Level 20 and claim your place among the elite.",
    objective: "Reach Hunter Level 20",
    xp_reward: 1500,
    coin_reward: 500,
    requirement: { level: 20 },
  },
  {
    chapter: 6,
    title: "Shadow Dominion",
    tagline: "Chapter VI",
    description: "The shadows bend to your will. Maintain a 21-day streak — three weeks of unbroken discipline.",
    objective: "21-day habit streak",
    xp_reward: 2000,
    coin_reward: 600,
    requirement: { habit_streak: 21 },
  },
  {
    chapter: 7,
    title: "Perfect Ascension",
    tagline: "Chapter VII",
    description: "Perfection is not a destination but a habit. Achieve 7 perfect days in your evolution log.",
    objective: "7 perfect days",
    xp_reward: 2500,
    coin_reward: 750,
    requirement: { perfect_days: 7 },
  },
  {
    chapter: 8,
    title: "Questbreaker",
    tagline: "Chapter VIII",
    description: "No gate remains closed. Complete 50 quests to prove your mastery over the system.",
    objective: "50 quests completed",
    xp_reward: 3000,
    coin_reward: 1000,
    requirement: { quests_completed: 50 },
  },
  {
    chapter: 9,
    title: "S-Rank Hunter",
    tagline: "Chapter IX",
    description: "Only the elite reach S-Rank. Ascend to S-Rank and stand among the apex hunters.",
    objective: "Reach S-Rank",
    xp_reward: 4000,
    coin_reward: 1500,
    requirement: { rank: "S" },
  },
  {
    chapter: 10,
    title: "Monarch's Throne",
    tagline: "Chapter X — Endgame",
    description: "The throne awaits. Reach Level 40, claim Monarch rank, and complete a Boss Rush to seal your legacy.",
    objective: "Level 40 + 1 Boss Rush win",
    xp_reward: 10000,
    coin_reward: 5000,
    requirement: { level: 40, boss_rush_wins: 1 },
  },
];

export const MAIN_QUEST_MAX_CHAPTER = MAIN_QUEST_CHAPTERS.length;

export function getCurrentMainQuestChapter(state: DashboardStats): number {
  return getExtended(state.profile).main_quest_chapter ?? 1;
}

export function getMainQuestChapter(chapter: number): MainQuestChapter | null {
  return MAIN_QUEST_CHAPTERS.find((c) => c.chapter === chapter) ?? null;
}

function countCompletedQuests(state: DashboardStats): number {
  return state.quests.filter((q) => q.status === "completed").length;
}

function getLongestHabitStreak(state: DashboardStats): number {
  return Math.max(0, ...state.habits.filter((h) => h.is_active).map((h) => h.current_streak));
}

function getPerfectDaysCount(state: DashboardStats): number {
  const meta = (state.dailyCompletion?.metadata ?? {}) as { perfect_days_week?: string[] };
  return (meta.perfect_days_week ?? []).length;
}

function getBossRushWins(state: DashboardStats): number {
  return getExtended(state.profile).boss_rush_wins ?? 0;
}

export function isChapterRequirementMet(
  state: DashboardStats,
  chapter: MainQuestChapter
): boolean {
  const req = chapter.requirement;

  if (req.level !== undefined && state.profile.player_level < req.level) return false;
  if (req.habit_streak !== undefined && getLongestHabitStreak(state) < req.habit_streak) return false;
  if (req.perfect_days !== undefined && getPerfectDaysCount(state) < req.perfect_days) return false;
  if (req.quests_completed !== undefined && countCompletedQuests(state) < req.quests_completed) return false;
  if (req.rank !== undefined) {
    const ranks = ["E", "D", "C", "B", "A", "S", "MONARCH"];
    if (ranks.indexOf(state.profile.rank) < ranks.indexOf(req.rank)) return false;
  }
  if (req.boss_rush_wins !== undefined && getBossRushWins(state) < req.boss_rush_wins) return false;

  return true;
}

/**
 * Check if the current chapter is complete and advance to the next one.
 * Returns true if the chapter was advanced.
 */
export function advanceMainQuestIfNeeded(state: DashboardStats): boolean {
  const current = getCurrentMainQuestChapter(state);
  if (current > MAIN_QUEST_MAX_CHAPTER) return false;

  const chapter = getMainQuestChapter(current);
  if (!chapter) return false;

  if (!isChapterRequirementMet(state, chapter)) return false;

  const nextChapter = current + 1;
  // Award XP and coins
  state.profile.total_xp += chapter.xp_reward;

  patchExtended(state.profile, {
    main_quest_chapter: nextChapter,
    shadow_coins: (getExtended(state.profile).shadow_coins ?? 0) + chapter.coin_reward,
    coin_log: [
      ...(getExtended(state.profile).coin_log ?? []),
      {
        at: new Date().toISOString(),
        delta: chapter.coin_reward,
        reason: `Main Quest: ${chapter.title}`,
      },
    ].slice(-50),
  });

  return true;
}

/** Get progress towards current chapter requirement (0–100). */
export function getChapterProgress(
  state: DashboardStats,
  chapter: MainQuestChapter
): { current: number; target: number; percent: number } {
  const req = chapter.requirement;

  if (req.level !== undefined) {
    const current = state.profile.player_level;
    const target = req.level;
    return { current, target, percent: Math.min(100, Math.round((current / target) * 100)) };
  }
  if (req.habit_streak !== undefined) {
    const current = getLongestHabitStreak(state);
    const target = req.habit_streak;
    return { current, target, percent: Math.min(100, Math.round((current / target) * 100)) };
  }
  if (req.perfect_days !== undefined) {
    const current = getPerfectDaysCount(state);
    const target = req.perfect_days;
    return { current, target, percent: Math.min(100, Math.round((current / target) * 100)) };
  }
  if (req.quests_completed !== undefined) {
    const current = countCompletedQuests(state);
    const target = req.quests_completed;
    return { current, target, percent: Math.min(100, Math.round((current / target) * 100)) };
  }
  if (req.rank !== undefined) {
    const ranks = ["E", "D", "C", "B", "A", "S", "MONARCH"];
    const current = ranks.indexOf(state.profile.rank);
    const target = ranks.indexOf(req.rank);
    return { current, target, percent: current >= target ? 100 : Math.round((current / Math.max(target, 1)) * 100) };
  }
  if (req.boss_rush_wins !== undefined) {
    const current = getBossRushWins(state);
    const target = req.boss_rush_wins;
    return { current, target, percent: Math.min(100, Math.round((current / target) * 100)) };
  }

  return { current: 0, target: 1, percent: 0 };
}

// Re-export isPerfectWeekActive for convenience in panel components
export { isPerfectWeekActive };
