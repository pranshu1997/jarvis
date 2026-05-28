import { calculateXp, levelFromXp, rankFromLevel } from "@/lib/xp-engine";
import { categoryXpFromHabits, getHabitBaseXp } from "@/lib/habit-xp";
import {
  ensureWeekShields,
  getComboCount,
  setComboCount,
  setPlayerSettings,
  consumeStreakShield,
  type LastUndoSnapshot,
} from "@/lib/player-settings";
import { rollupSkillTree } from "@/lib/workout-progression";
import { todayISO } from "@/lib/utils";
import type { DashboardStats, Habit, RankTier, XpEvent } from "@/types/database";
import { randomUUID } from "crypto";
import { logHabitToCalendar } from "@/lib/activity-calendar";
import { syncAchievements } from "@/lib/achievements-db";
import { damageDungeonBoss } from "@/lib/dungeons";
import { getPhoenixWindow, applyPhoenixOnComplete } from "@/lib/phoenix";
import { addShadowCoins } from "@/lib/player-settings-extended";
import { updateWeeklyGeneratedQuests } from "@/lib/weekly-quest-gen";

export function getHabitCategorySlug(habit: Habit): string {
  return (
    (habit.metadata as { category_slug?: string })?.category_slug ??
    habit.category_id?.replace("cat-", "") ??
    "physical"
  );
}

export function syncCategoriesFromHabits(state: DashboardStats): void {
  for (const cat of state.categories) {
    const catHabits = state.habits.filter(
      (h) => h.is_active && getHabitCategorySlug(h) === cat.slug
    );
    const { total } = categoryXpFromHabits(catHabits, state.habits);
    cat.total_xp = total;
    cat.level = levelFromXp(cat.total_xp);
    cat.rank = rankFromLevel(cat.level);
    cat.current_streak = Math.max(0, ...catHabits.map((h) => h.current_streak), 0);
  }
}

export function isCategoryComplete(
  state: DashboardStats,
  categorySlug: string
): boolean {
  const habits = state.habits.filter(
    (h) => getHabitCategorySlug(h) === categorySlug && h.is_active
  );
  return habits.length > 0 && habits.every((h) => h.completed_today);
}

export function updateQuestProgress(
  state: DashboardStats,
  opts?: { categorySlug?: string; habitSlug?: string }
): void {
  const completedCount = state.habits.filter((h) => h.completed_today).length;
  const totalHabits = state.habits.filter((h) => h.is_active).length;

  for (const quest of state.quests) {
    if (quest.status !== "active") continue;
    const meta = quest.metadata as Record<string, unknown>;

    if (quest.slug === "perfect_day") {
      quest.current_count = completedCount;
      quest.target_count = totalHabits;
      if (completedCount >= totalHabits && totalHabits > 0) {
        quest.status = "completed";
        quest.completed_at = new Date().toISOString();
      }
      continue;
    }

    const qCat = meta.category_slug as string | undefined;
    if (qCat && opts?.categorySlug === qCat) {
      const catHabits = state.habits.filter(
        (h) => getHabitCategorySlug(h) === qCat && h.is_active
      );
      quest.current_count = catHabits.filter((h) => h.completed_today).length;
      quest.target_count = catHabits.length;
      if (quest.current_count >= quest.target_count && quest.target_count > 0) {
        quest.status = "completed";
        quest.completed_at = new Date().toISOString();
      }
    }

    const habitSlug = meta.habit_slug as string | undefined;
    if (habitSlug && opts?.habitSlug === habitSlug) {
      const habit = state.habits.find((h) => h.slug === habitSlug);
      if (habit?.completed_today) {
        quest.current_count = Math.min(
          quest.target_count,
          Math.max(quest.current_count, habit.current_streak)
        );
        if (
          quest.current_count >= quest.target_count &&
          quest.target_count > 0
        ) {
          quest.status = "completed";
          quest.completed_at = new Date().toISOString();
        }
      }
    }

    if (quest.quest_type === "weekly" && quest.slug.includes("perfect")) {
      const perfectDays = getPerfectDaysThisWeek(state);
      quest.current_count = perfectDays.length;
      if (quest.current_count >= quest.target_count && quest.target_count > 0) {
        quest.status = "completed";
        quest.completed_at = new Date().toISOString();
      }
    }
  }

  awardQuestRewards(state);
  updateWeeklyGeneratedQuests(state, opts);
}

function awardQuestRewards(state: DashboardStats): void {
  for (const quest of state.quests) {
    if (quest.status !== "completed") continue;
    const meta = quest.metadata as { rewarded?: boolean };
    if (meta.rewarded) continue;
    if (quest.xp_reward > 0) {
      state.profile.total_xp += quest.xp_reward;
      state.profile.player_level = levelFromXp(state.profile.total_xp);
      state.profile.rank = rankFromLevel(state.profile.player_level);
      addShadowCoins(state, Math.floor(quest.xp_reward / 5), `Quest: ${quest.title}`);
    }
    quest.metadata = { ...meta, rewarded: true };
  }
}

function getPerfectDaysThisWeek(state: DashboardStats): string[] {
  const meta = (state.dailyCompletion?.metadata ?? {}) as {
    perfect_days_week?: string[];
  };
  return meta.perfect_days_week ?? [];
}

function recordPerfectDayIfNeeded(state: DashboardStats): void {
  if (!state.dailyCompletion?.perfect_day) return;
  const today = todayISO();
  const meta = (state.dailyCompletion.metadata ?? {}) as {
    perfect_days_week?: string[];
  };
  const days = meta.perfect_days_week ?? [];
  if (!days.includes(today)) {
    meta.perfect_days_week = [...days, today].slice(-7);
    state.dailyCompletion.metadata = meta;
  }
}

export function isPerfectWeekActive(state: DashboardStats): boolean {
  const days = getPerfectDaysThisWeek(state);
  return days.length >= 5;
}

export function syncPlayerScores(state: DashboardStats): void {
  const habits = state.habits.filter((h) => h.is_active);
  const completedToday = habits.filter((h) => h.completed_today).length;
  const total = habits.length || 1;
  const avgStreak =
    habits.reduce((s, h) => s + h.current_streak, 0) / total;
  const categoryLevels =
    state.categories.reduce((s, c) => s + c.level, 0) /
    Math.max(state.categories.length, 1);

  state.profile.momentum_score = Math.min(
    100,
    Math.max(
      0,
      Math.round(state.profile.momentum_score * 0.92 + (completedToday > 0 ? 6 : -3))
    )
  );
  state.profile.consistency_score = Math.min(
    100,
    Math.round(avgStreak * 6 + completedToday * 2)
  );
  state.profile.discipline_score = Math.min(
    100,
    Math.round(
      state.profile.discipline_score * 0.9 + (completedToday / total) * 25
    )
  );
  state.profile.power_score = Math.min(
    100,
    Math.round(categoryLevels * 6 + state.profile.player_level * 0.8)
  );
}

export function syncDailyCompletion(state: DashboardStats): void {
  if (!state.dailyCompletion) return;
  const active = state.habits.filter((h) => h.is_active);
  state.dailyCompletion.total_habits = active.length;
  state.dailyCompletion.completed_habits = active.filter(
    (h) => h.completed_today
  ).length;
  state.dailyCompletion.physical_complete = isCategoryComplete(
    state,
    "physical"
  );
  state.dailyCompletion.mental_complete = isCategoryComplete(state, "mental");
  state.dailyCompletion.awareness_complete = isCategoryComplete(
    state,
    "awareness"
  );
  state.dailyCompletion.vitality_complete = isCategoryComplete(
    state,
    "vitality"
  );
  state.dailyCompletion.perfect_day =
    state.dailyCompletion.completed_habits >= state.dailyCompletion.total_habits &&
    state.dailyCompletion.total_habits > 0;
}

export interface CompleteHabitResult {
  phoenixBonus?: number;
  xpEarned: number;
  playerLevel: number;
  previousLevel: number;
  previousRank: RankTier;
  newRank: RankTier;
  categoryComplete?: string;
  perfectDay?: boolean;
  comboCount?: number;
  multipliers?: ReturnType<typeof calculateXp>["multipliers"];
}

function saveUndoSnapshot(
  state: DashboardStats,
  snapshot: LastUndoSnapshot
): void {
  setPlayerSettings(state.profile, { last_undo: snapshot });
}

export function skipHabitInState(
  state: DashboardStats,
  habitId: string,
  reason: "rest" | "sick" | "travel"
): { success: boolean; shieldsLeft: number; error?: string } {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return { success: false, shieldsLeft: 0, error: "Habit not found" };
  if (habit.completed_today) {
    return { success: false, shieldsLeft: 0, error: "Already completed" };
  }
  const meta = habit.metadata as Record<string, unknown>;
  if (meta.skipped_today) {
    return { success: false, shieldsLeft: 0, error: "Already skipped" };
  }

  if (!consumeStreakShield(state)) {
    return {
      success: false,
      shieldsLeft: 0,
      error: "No streak shields left this week",
    };
  }

  habit.metadata = {
    ...meta,
    skipped_today: true,
    skip_reason: reason,
  };

  return { success: true, shieldsLeft: ensureWeekShields(state) };
}

export function undoLastAction(state: DashboardStats): boolean {
  const undo = state.profile.settings?.last_undo as LastUndoSnapshot | undefined;
  if (!undo) return false;
  const age = Date.now() - new Date(undo.created_at).getTime();
  if (age > 60_000) {
    setPlayerSettings(state.profile, { last_undo: null });
    return false;
  }

  if (undo.type === "habit_complete" && undo.habitId && undo.habitSnapshot) {
    const habit = state.habits.find((h) => h.id === undo.habitId);
    if (habit) {
      Object.assign(habit, undo.habitSnapshot);
    }
    state.profile.total_xp = Math.max(0, state.profile.total_xp - undo.xpRemoved);
    state.profile.player_level = levelFromXp(state.profile.total_xp);
    state.profile.rank = rankFromLevel(state.profile.player_level);
    if (undo.eventId) {
      state.recentXpEvents = state.recentXpEvents.filter((e) => e.id !== undo.eventId);
    }
    if (state.dailyCompletion) {
      state.dailyCompletion.total_xp = Math.max(
        0,
        state.dailyCompletion.total_xp - undo.xpRemoved
      );
    }
    setComboCount(state, undo.comboBefore);
    syncCategoriesFromHabits(state);
    syncDailyCompletion(state);
    syncPlayerScores(state);
  }

  setPlayerSettings(state.profile, { last_undo: null });
  return true;
}

export function completeHabitInState(
  state: DashboardStats,
  habitId: string,
  userId: string,
  opts?: { isCategoryCompleteBonus?: boolean }
): CompleteHabitResult | null {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit || habit.completed_today) return null;

  const categorySlug = getHabitCategorySlug(habit);
  const categoryWasComplete = isCategoryComplete(state, categorySlug);
  const previousLevel = state.profile.player_level;
  const previousRank = state.profile.rank;
  const comboBefore = getComboCount(state);

  const habitSnapshot = JSON.parse(JSON.stringify(habit)) as Habit;

  const effectiveBaseXp = getHabitBaseXp(habit, state.habits);
  habit.base_xp = effectiveBaseXp;

  habit.completed_today = true;
  const phoenixBonus = getPhoenixWindow(habit)
    ? applyPhoenixOnComplete(state, habit)
    : 0;
  if (phoenixBonus === 0) {
    habit.current_streak += 1;
  }
  habit.longest_streak = Math.max(habit.longest_streak, habit.current_streak);

  const willCompleteCategory =
    !categoryWasComplete && isCategoryComplete(state, categorySlug);

  syncDailyCompletion(state);
  recordPerfectDayIfNeeded(state);

  const comboCount = comboBefore + 1;
  setComboCount(state, comboCount);

  const xp = calculateXp({
    baseXp: effectiveBaseXp,
    streakDays: habit.current_streak,
    comboCount,
    momentumScore: state.profile.momentum_score,
    consistencyScore: state.profile.consistency_score,
    isCategoryComplete: willCompleteCategory || opts?.isCategoryCompleteBonus,
    isPerfectDay: !!state.dailyCompletion?.perfect_day,
    isPerfectWeek: isPerfectWeekActive(state),
  });

  const totalXpGain = xp.finalXp + phoenixBonus;

  habit.total_xp += totalXpGain;
  habit.level = levelFromXp(habit.total_xp);

  state.profile.total_xp += totalXpGain;
  state.profile.player_level = levelFromXp(state.profile.total_xp);
  state.profile.rank = rankFromLevel(state.profile.player_level);

  const event: XpEvent = {
    id: randomUUID(),
    user_id: userId,
    entity_type: "habit",
    entity_id: habitId,
    base_xp: xp.baseXp,
    final_xp: totalXpGain,
    streak_multiplier: xp.multipliers.streak,
    combo_multiplier: xp.multipliers.combo,
    consistency_multiplier: xp.multipliers.consistency,
    momentum_multiplier: xp.multipliers.momentum,
    bonus_multiplier: xp.multipliers.bonus,
    reason: `${habit.name} completed`,
    metadata: {},
    created_at: new Date().toISOString(),
  };
  state.recentXpEvents = [event, ...state.recentXpEvents].slice(0, 100);

  if (state.dailyCompletion) {
    state.dailyCompletion.total_xp += totalXpGain;
  }

  logHabitToCalendar(state, habitId, totalXpGain);
  addShadowCoins(state, Math.max(1, Math.floor(totalXpGain / 10)), habit.name);
  damageDungeonBoss(state, habitId);

  if (habit.slug === "sports_habit" && state.sports?.length) {
    const overall = state.sports.find((s) => s.slug === "overall");
    if (overall) {
      const bonus = Math.round(xp.finalXp * 0.5);
      overall.total_xp += bonus;
      overall.level = levelFromXp(overall.total_xp);
      overall.rank = rankFromLevel(overall.level);
    }
    const branch = state.skills?.find((s) => s.slug === "sports_branch");
    if (branch) {
      branch.total_xp += xp.finalXp;
      branch.level = levelFromXp(branch.total_xp);
      branch.rank = rankFromLevel(branch.level);
    }
  }

  if (habit.slug === "workout_habit" && state.skills?.length) {
    const strength = state.skills.find((s) => s.slug === "strength");
    if (strength) {
      strength.total_xp += xp.finalXp;
      strength.level = levelFromXp(strength.total_xp);
      strength.rank = rankFromLevel(strength.level);
    }
    rollupSkillTree(state.skills);
  }

  syncCategoriesFromHabits(state);
  syncPlayerScores(state);
  updateQuestProgress(state, {
    categorySlug,
    habitSlug: habit.slug,
  });
  syncAchievements(state);

  const categoryComplete =
    !categoryWasComplete && isCategoryComplete(state, categorySlug)
      ? categorySlug
      : undefined;

  saveUndoSnapshot(state, {
    type: "habit_complete",
    habitId,
    habitSnapshot,
    xpRemoved: totalXpGain,
    eventId: event.id,
    wasCompleted: true,
    comboBefore,
    created_at: new Date().toISOString(),
  });

  return {
    xpEarned: totalXpGain,
    phoenixBonus: phoenixBonus > 0 ? phoenixBonus : undefined,
    playerLevel: state.profile.player_level,
    previousLevel,
    previousRank,
    newRank: state.profile.rank,
    categoryComplete,
    perfectDay: state.dailyCompletion?.perfect_day,
    comboCount,
    multipliers: xp.multipliers,
  };
}

export function getHabitProgress(habit: Habit): {
  current: number;
  target: number;
  percent: number;
  isQuantified: boolean;
} {
  const meta = habit.metadata as {
    current_value?: number;
    category_slug?: string;
  };
  const target = habit.target_value ?? 0;
  const current = meta.current_value ?? 0;
  if (!target || target <= 0) {
    return { current: 0, target: 0, percent: habit.completed_today ? 100 : 0, isQuantified: false };
  }
  return {
    current,
    target,
    percent: Math.min(100, Math.round((current / target) * 100)),
    isQuantified: true,
  };
}

export function adjustHabitValue(
  state: DashboardStats,
  habitId: string,
  delta: number,
  userId: string
): (CompleteHabitResult & { uncompleted?: boolean }) | null {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit || !habit.target_value) return null;

  const meta = habit.metadata as { current_value?: number };
  const prev = meta.current_value ?? 0;
  const next = Math.max(0, prev + delta);
  habit.metadata = { ...meta, current_value: next };

  if (habit.completed_today && next < habit.target_value) {
    habit.completed_today = false;
    syncDailyCompletion(state);
    return {
      xpEarned: 0,
      playerLevel: state.profile.player_level,
      previousLevel: state.profile.player_level,
      previousRank: state.profile.rank,
      newRank: state.profile.rank,
      uncompleted: true,
    };
  }

  if (!habit.completed_today && next >= habit.target_value) {
    return completeHabitInState(state, habitId, userId);
  }
  return {
    xpEarned: 0,
    playerLevel: state.profile.player_level,
    previousLevel: state.profile.player_level,
    previousRank: state.profile.rank,
    newRank: state.profile.rank,
  };
}

/** @deprecated use adjustHabitValue */
export const incrementHabitValue = adjustHabitValue;
