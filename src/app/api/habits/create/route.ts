import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isLocalAuthMode } from "@/lib/auth/config";
import { getLocalSessionUser } from "@/lib/auth/session";
import { persistUserState } from "@/lib/local/mutations";
import {
  computeHabitBaseXp,
  HABIT_BASELINE_SLUG,
  resolveBaselineXp,
} from "@/lib/habit-xp";
import { syncCategoriesFromHabits, syncDailyCompletion } from "@/lib/game-logic";
import type { Habit } from "@/types/database";

const CORE_CATEGORIES = ["physical", "mental", "awareness", "vitality"] as const;

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = (body.name as string)?.trim();
  const categorySlug = body.categorySlug as string;
  const toughness = Math.max(0.25, Math.min(5, Number(body.toughness) || 1));
  const baselineSlug = (body.baselineSlug as string) || HABIT_BASELINE_SLUG;

  if (!name || !CORE_CATEGORIES.includes(categorySlug as typeof CORE_CATEGORIES[number])) {
    return NextResponse.json({ error: "Invalid name or category" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);

  let habit: Habit | null = null;
  let baseXp = 0;
  let categoryName = categorySlug;
  let categoryLevel = 1;
  let createError: string | null = null;

  await persistUserState(sessionUser.id, (state) => {
    const duplicate = state.habits.some(
      (h) =>
        h.is_active &&
        h.name.toLowerCase() === name.toLowerCase() &&
        (h.metadata as { category_slug?: string })?.category_slug === categorySlug
    );
    if (duplicate) {
      createError = "A habit with this name already exists in that category";
      return;
    }

    const baselineXp = resolveBaselineXp(state.habits, baselineSlug);
    baseXp = computeHabitBaseXp(baselineXp, toughness);

    const category = state.categories.find((c) => c.slug === categorySlug);

    habit = {
      id: randomUUID(),
      user_id: sessionUser.id,
      category_id: category?.id ?? null,
      skill_id: null,
      slug: `${slug || "habit"}-${Date.now().toString(36).slice(-4)}`,
      name,
      description: null,
      icon: "zap",
      base_xp: baseXp,
      level: 1,
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      target_value: body.targetValue ? Number(body.targetValue) : null,
      unit: (body.unit as string)?.trim() || null,
      is_system: false,
      is_active: true,
      metadata: {
        category_slug: categorySlug,
        toughness,
        baseline_slug: baselineSlug,
        baseline_xp: baselineXp,
        current_value: 0,
        ...(body.preferredPeriod
          ? { preferred_period: body.preferredPeriod }
          : {}),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_today: false,
    };

    state.habits.push(habit);
    syncCategoriesFromHabits(state);
    syncDailyCompletion(state);
    if (state.dailyCompletion) {
      state.dailyCompletion.total_habits = state.habits.filter((h) => h.is_active).length;
    }

    categoryName = category?.name ?? categorySlug;
    categoryLevel = category?.level ?? 1;
  });

  if (createError) {
    return NextResponse.json({ error: createError }, { status: 400 });
  }

  if (!habit) {
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    habit,
    baseXp,
    toughness,
    baselineSlug,
    categorySlug,
    categoryName,
    categoryLevel,
  });
}
