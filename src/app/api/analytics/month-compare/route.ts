import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended } from "@/lib/player-settings-extended";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { comparison: null as Record<string, unknown> | null };
    await withGameState((state) => {
      const calendar = getExtended(state.profile).activity_calendar ?? {};
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      function sumMonth(month: number, year: number) {
        let xp = 0;
        let days = 0;
        for (const [date, entry] of Object.entries(calendar)) {
          const d = new Date(date);
          if (d.getMonth() === month && d.getFullYear() === year) {
            xp += entry.total_xp ?? 0;
            days++;
          }
        }
        return { xp, days };
      }

      const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      const current = sumMonth(thisMonth, thisYear);
      const previous = sumMonth(prevMonth, prevYear);

      holder.comparison = {
        current: { month: thisMonth + 1, year: thisYear, ...current },
        previous: { month: prevMonth + 1, year: prevYear, ...previous },
        xpDelta: current.xp - previous.xp,
        daysDelta: current.days - previous.days,
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
