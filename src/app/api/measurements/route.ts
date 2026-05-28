import { NextResponse } from "next/server";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();

  try {
    await withGameState((state) => {
      const logs = [...(getExtended(state.profile).body_measurements ?? [])];
      const entry = {
        date: todayISO(),
        waist: body.waist ? Number(body.waist) : undefined,
        chest: body.chest ? Number(body.chest) : undefined,
        arms: body.arms ? Number(body.arms) : undefined,
        thighs: body.thighs ? Number(body.thighs) : undefined,
        body_fat_pct: body.bodyFatPct ? Number(body.bodyFatPct) : undefined,
      };
      const idx = logs.findIndex((l) => l.date === entry.date);
      if (idx >= 0) logs[idx] = entry;
      else logs.push(entry);
      patchExtended(state.profile, { body_measurements: logs.slice(-52) });

      const habit = state.habits.find((h) => h.slug === "diet_tracking");
      if (habit && entry.waist) {
        habit.metadata = { ...(habit.metadata as object), last_waist: entry.waist };
      }
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let logs: unknown[] = [];
    await withGameState((state) => {
      logs = getExtended(state.profile).body_measurements ?? [];
    });
    return NextResponse.json({ logs });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
