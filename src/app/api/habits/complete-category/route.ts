import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { completeHabitInState, getHabitCategorySlug } from "@/lib/game-logic";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { categorySlug?: string };
  if (!body.categorySlug) return NextResponse.json({ error: "categorySlug required" }, { status: 400 });

  try {
    const holder = { completed: 0, xp: 0 };
    await withGameState((state) => {
      for (const habit of state.habits) {
        if (!habit.is_active || habit.completed_today) continue;
        if (getHabitCategorySlug(habit) !== body.categorySlug) continue;
        const result = completeHabitInState(state, habit.id, state.profile.id);
        if (result) {
          holder.completed++;
          holder.xp += result.xpEarned;
        }
      }
    });
    return NextResponse.json({ success: true, completed: holder.completed, xpEarned: holder.xp });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
