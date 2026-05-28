import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { getLocalSessionUser } from "@/lib/auth/session";
import { persistUserState } from "@/lib/local/mutations";

export async function POST() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let totalXp = 0;
  let exerciseCount = 0;

  await persistUserState(sessionUser.id, (state) => {
    const active = state.workoutSessions?.find((s) => s.is_active);
    if (!active) return;

    active.is_active = false;
    active.ended_at = new Date().toISOString();
    totalXp = active.total_xp;
    exerciseCount = active.exercise_count;
  });

  return NextResponse.json({
    success: true,
    totalXp,
    exerciseCount,
  });
}
