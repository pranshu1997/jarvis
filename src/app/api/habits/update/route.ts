import { NextResponse } from "next/server";
import { syncCategoriesFromHabits, syncDailyCompletion } from "@/lib/game-logic";
import { computeHabitBaseXp, HABIT_BASELINE_SLUG, resolveBaselineXp } from "@/lib/habit-xp";
import { stepsHabitDisplayName } from "@/lib/quantified-habits";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function PATCH(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const {
    habitId,
    name,
    categorySlug,
    toughness,
    baselineSlug,
    targetValue,
    unit,
    preferredPeriod,
    sortOrder,
  } = body as Record<string, unknown>;

  if (!habitId) {
    return NextResponse.json({ error: "habitId required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) throw new Error("Habit not found");

      if (typeof name === "string" && name.trim()) habit.name = name.trim();
      if (typeof categorySlug === "string") {
        (habit.metadata as Record<string, unknown>).category_slug = categorySlug;
      }
      if (toughness != null) {
        const t = Math.max(0.25, Math.min(5, Number(toughness) || 1));
        const baseSlug = (baselineSlug as string) || HABIT_BASELINE_SLUG;
        const baselineXp = resolveBaselineXp(state.habits, baseSlug);
        habit.base_xp = computeHabitBaseXp(baselineXp, t);
        Object.assign(habit.metadata, {
          toughness: t,
          baseline_slug: baseSlug,
          baseline_xp: baselineXp,
        });
      }
      if (targetValue != null) habit.target_value = Number(targetValue) || null;
      if (unit !== undefined) habit.unit = (unit as string)?.trim() || null;
      if (preferredPeriod) {
        (habit.metadata as Record<string, unknown>).preferred_period = preferredPeriod;
      }
      if (habit.slug.startsWith("steps") || habit.unit === "steps") {
        if (habit.target_value) habit.name = stepsHabitDisplayName(habit.target_value);
      }
      if (typeof sortOrder === "number") {
        (habit.metadata as Record<string, unknown>).sort_order = sortOrder;
      }

      syncCategoriesFromHabits(state);
      syncDailyCompletion(state);
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
