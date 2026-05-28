import type { DashboardStats, Habit, Quest } from "@/types/database";
import { getHabitCategorySlug } from "@/lib/game-logic";
import { ensureWeekShields } from "@/lib/player-settings";

export function getAtRiskHabits(state: DashboardStats): Habit[] {
  const hour = new Date().getHours();
  if (hour < 16) return [];
  return state.habits.filter(
    (h) =>
      h.is_active &&
      !h.completed_today &&
      !(h.metadata as { skipped_today?: boolean }).skipped_today &&
      h.current_streak >= 3
  );
}

export function getPriorityHabit(state: DashboardStats): Habit | null {
  const incomplete = state.habits.filter(
    (h) =>
      h.is_active &&
      !h.completed_today &&
      !(h.metadata as { skipped_today?: boolean }).skipped_today
  );
  if (!incomplete.length) return null;

  const byCategory = state.categories.map((cat) => {
    const catHabits = incomplete.filter(
      (h) => getHabitCategorySlug(h) === cat.slug
    );
    const done = state.habits.filter(
      (h) =>
        h.is_active &&
        getHabitCategorySlug(h) === cat.slug &&
        h.completed_today
    ).length;
    const total = state.habits.filter(
      (h) => h.is_active && getHabitCategorySlug(h) === cat.slug
    ).length;
    return {
      cat,
      ratio: total ? done / total : 1,
      first: catHabits[0],
    };
  });

  byCategory.sort((a, b) => a.ratio - b.ratio);
  return byCategory.find((b) => b.first)?.first ?? incomplete[0];
}

export function getPinnedQuest(state: DashboardStats): Quest | null {
  const id = state.profile.settings?.pinned_quest_id as string | undefined;
  if (!id) return null;
  return state.quests.find((q) => q.id === id && q.status === "active") ?? null;
}

export function getBriefSummary(state: DashboardStats) {
  const incomplete = state.habits.filter(
    (h) => h.is_active && !h.completed_today
  ).length;
  return {
    incomplete,
    atRisk: getAtRiskHabits(state).length,
    shields: ensureWeekShields(state),
    todayXp: state.todayXpEarned ?? state.dailyCompletion?.total_xp ?? 0,
  };
}
