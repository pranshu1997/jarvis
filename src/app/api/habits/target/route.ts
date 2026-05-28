import { NextResponse } from "next/server";
import { syncDailyCompletion } from "@/lib/game-logic";
import {
  stepsHabitDisplayName,
  CONFIGURABLE_TARGET_SLUGS,
  getTargetOptionsForHabit,
  isConfigurableQuantifiedHabit,
} from "@/lib/quantified-habits";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function PATCH(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const { habitId, targetValue } = body as {
    habitId: string;
    targetValue: number;
  };

  if (!habitId || targetValue == null || targetValue <= 0) {
    return NextResponse.json(
      { error: "habitId and positive targetValue required" },
      { status: 400 }
    );
  }

  try {
    let name: string | undefined;
    await withGameState((state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit || !habit.target_value) {
        throw new Error("Habit not found or not quantified");
      }

      habit.target_value = targetValue;
      if (habit.slug.startsWith("steps") || habit.unit === "steps") {
        habit.name = stepsHabitDisplayName(targetValue);
      }

      const meta = habit.metadata as { current_value?: number };
      const current = meta.current_value ?? 0;
      if (current < targetValue && habit.completed_today) {
        habit.completed_today = false;
      }

      syncDailyCompletion(state);
      name = habit.name;
    });

    return NextResponse.json({ success: true, targetValue, name });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const habits: {
      id: string;
      slug: string;
      name: string;
      target: number;
      unit: string | null;
      options: number[];
    }[] = [];

    await withGameState((state) => {
      for (const h of state.habits) {
        if (!h.is_active || !isConfigurableQuantifiedHabit(h)) continue;
        habits.push({
          id: h.id,
          slug: h.slug,
          name: h.name,
          target: h.target_value ?? 0,
          unit: h.unit,
          options: getTargetOptionsForHabit(h),
        });
      }
    });

    return NextResponse.json({ habits, slugs: CONFIGURABLE_TARGET_SLUGS });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
