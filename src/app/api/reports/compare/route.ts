import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

function weekStart(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export async function GET(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const weekA = searchParams.get("weekA");
  const weekB = searchParams.get("weekB");
  if (!weekA || !weekB) {
    return NextResponse.json({ error: "weekA and weekB required (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    const holder = { comparison: null as Record<string, unknown> | null };
    await withGameState((state) => {
      const calendar = (state.profile.settings as { activity_calendar?: Record<string, { total_xp: number; habit_ids: string[] }> })?.activity_calendar ?? {};
      const startA = weekStart(weekA);
      const startB = weekStart(weekB);

      function sumWeek(start: Date) {
        let xp = 0;
        let habits = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          const entry = calendar[key];
          if (entry) {
            xp += entry.total_xp ?? 0;
            habits += entry.habit_ids?.length ?? 0;
          }
        }
        return { xp, habits };
      }

      const a = sumWeek(startA);
      const b = sumWeek(startB);
      holder.comparison = {
        weekA: { start: startA.toISOString().slice(0, 10), ...a },
        weekB: { start: startB.toISOString().slice(0, 10), ...b },
        xpDelta: b.xp - a.xp,
        habitsDelta: b.habits - a.habits,
      };
    });
    return NextResponse.json(holder.comparison);
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
