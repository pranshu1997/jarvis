import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getActivityCalendar } from "@/lib/player-settings-extended";

export async function GET() {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });

  try {
    let csv = "date,physical,mental,awareness,vitality,total_xp,habit_count\n";
    await withGameState((state) => {
      const cal = getActivityCalendar(state);
      for (const [date, entry] of Object.entries(cal).sort(([a], [b]) => a.localeCompare(b))) {
        csv += `${date},${entry.physical},${entry.mental},${entry.awareness},${entry.vitality},${entry.total_xp},${(entry.habit_ids ?? []).length}\n`;
      }
    });
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="jarvis-activity.csv"',
      },
    });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
