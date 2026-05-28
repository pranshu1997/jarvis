import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getWeightLogs, setPlayerSettings } from "@/lib/player-settings";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const kg = Number(body.kg);
  if (!kg || kg < 30 || kg > 300) {
    return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
  }

  try {
    let logs: { date: string; kg: number }[] = [];

    await withGameState((state) => {
      const today = todayISO();
      const existing = getWeightLogs(state).filter((e) => e.date !== today);
      logs = [{ date: today, kg }, ...existing].slice(0, 90);
      setPlayerSettings(state.profile, { weight_logs: logs });

      const habit = state.habits.find((h) => h.slug === "weight_tracking");
      if (habit && !habit.completed_today) {
        habit.completed_today = true;
        habit.metadata = {
          ...(habit.metadata as object),
          last_weight_kg: kg,
        };
      }
    });

    return NextResponse.json({ success: true, logs });
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
    let logs: { date: string; kg: number }[] = [];
    await withGameState((state) => {
      logs = getWeightLogs(state);
    });
    return NextResponse.json({ logs });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
