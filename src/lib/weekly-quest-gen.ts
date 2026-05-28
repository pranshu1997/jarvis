import { randomUUID } from "crypto";
import type { DashboardStats } from "@/types/database";
import { getHabitCategorySlug } from "@/lib/game-logic";
import { getWeekKey } from "@/lib/player-settings";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";

export function generateWeeklyQuestsIfNeeded(state: DashboardStats): boolean {
  const ext = getExtended(state.profile);
  const weekKey = getWeekKey();
  if (ext.weekly_quest_gen_week === weekKey) return false;

  for (const q of state.quests) {
    if (q.quest_type === "weekly" && q.status === "active" && q.is_system) {
      q.status = "expired";
    }
  }

  const habits = state.habits.filter((h) => h.is_active);
  const lowestStreak = [...habits].sort(
    (a, b) => a.current_streak - b.current_streak
  )[0];
  const weakestCat = [...state.categories].sort(
    (a, b) => a.total_xp - b.total_xp
  )[0];

  const newQuests = [
    {
      title: lowestStreak
        ? `Streak focus: ${lowestStreak.name}`
        : "Build a streak",
      slug: "weekly_streak_focus",
      target: 5,
      xp: 80,
      meta: { habit_slug: lowestStreak?.slug },
    },
    {
      title: `Elevate ${weakestCat?.name ?? "category"}`,
      slug: "weekly_category",
      target: 5,
      xp: 100,
      meta: { category_slug: weakestCat?.slug },
    },
    {
      title: "Perfect days × 3",
      slug: "weekly_perfect_3",
      target: 3,
      xp: 150,
      meta: { perfect_days: true },
    },
  ];

  for (const nq of newQuests) {
    state.quests.push({
      id: randomUUID(),
      user_id: state.profile.id,
      slug: nq.slug,
      title: nq.title,
      description: null,
      quest_type: "weekly",
      status: "active",
      target_count: nq.target,
      current_count: 0,
      xp_reward: nq.xp,
      rank_required: null,
      category_id: null,
      is_system: true,
      expires_at: null,
      completed_at: null,
      metadata: nq.meta,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  patchExtended(state.profile, { weekly_quest_gen_week: weekKey });
  return true;
}

export function updateWeeklyGeneratedQuests(
  state: DashboardStats,
  opts?: { categorySlug?: string; habitSlug?: string }
): void {
  for (const quest of state.quests) {
    if (quest.quest_type !== "weekly" || quest.status !== "active") continue;
    const meta = quest.metadata as Record<string, unknown>;

    if (meta.category_slug && opts?.categorySlug === meta.category_slug) {
      const catHabits = state.habits.filter(
        (h) => getHabitCategorySlug(h) === meta.category_slug && h.is_active
      );
      quest.current_count = catHabits.filter((h) => h.completed_today).length;
      if (quest.current_count >= quest.target_count) {
        quest.status = "completed";
        quest.completed_at = new Date().toISOString();
      }
    }

    if (meta.habit_slug) {
      const h = state.habits.find((x) => x.slug === meta.habit_slug);
      if (h?.completed_today) {
        quest.current_count = Math.min(quest.target_count, quest.current_count + 1);
        if (quest.current_count >= quest.target_count) {
          quest.status = "completed";
          quest.completed_at = new Date().toISOString();
        }
      }
    }

    if (meta.perfect_days && state.dailyCompletion?.perfect_day) {
      quest.current_count = Math.min(quest.target_count, quest.current_count + 1);
      if (quest.current_count >= quest.target_count) {
        quest.status = "completed";
        quest.completed_at = new Date().toISOString();
      }
    }
  }
}
