import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { addHabitCompletionNote } from "@/lib/habit-notes";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { habitId?: string; note?: string };
  if (!body.habitId || !body.note?.trim()) {
    return NextResponse.json({ error: "habitId and note required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      addHabitCompletionNote(state, body.habitId!, body.note!.trim());
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
