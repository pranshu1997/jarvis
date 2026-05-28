import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isLocalAuthMode } from "@/lib/auth/config";
import { getLocalSessionUser } from "@/lib/auth/session";
import { persistUserState } from "@/lib/local/mutations";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const branchSlug = (body.branchSlug as string) || "strength";

  let sessionId = "";

  await persistUserState(sessionUser.id, (state) => {
    if (!state.workoutSessions) state.workoutSessions = [];

    for (const s of state.workoutSessions) {
      if (s.is_active) {
        s.is_active = false;
        s.ended_at = new Date().toISOString();
      }
    }

    const session = {
      id: randomUUID(),
      user_id: sessionUser.id,
      session_type: branchSlug,
      branch_slug: branchSlug,
      started_at: new Date().toISOString(),
      ended_at: null,
      total_xp: 0,
      exercise_count: 0,
      notes: null,
      is_active: true,
      metadata: {},
    };
    state.workoutSessions.unshift(session);
    sessionId = session.id;
  });

  return NextResponse.json({ success: true, sessionId, branchSlug });
}
