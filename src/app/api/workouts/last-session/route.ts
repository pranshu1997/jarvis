import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let payload: {
      sessionId: string | null;
      branchSlug: string | null;
      exerciseIds: string[];
      exerciseNames: string[];
    } = {
      sessionId: null,
      branchSlug: null,
      exerciseIds: [],
      exerciseNames: [],
    };

    await withGameState((state) => {
      const last = state.workoutSessions?.find((s) => !s.is_active && s.ended_at);
      if (!last) return;

      const sessionLogs = (state.workoutLogs ?? []).filter(
        (l) => l.session_id === last.id
      );
      const seen = new Set<string>();
      const ids: string[] = [];
      const names: string[] = [];
      for (const log of sessionLogs) {
        if (!seen.has(log.exercise_id)) {
          seen.add(log.exercise_id);
          ids.push(log.exercise_id);
          names.push(log.exercise_name);
        }
      }

      payload = {
        sessionId: last.id,
        branchSlug: last.branch_slug,
        exerciseIds: ids,
        exerciseNames: names,
      };
    });

    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
