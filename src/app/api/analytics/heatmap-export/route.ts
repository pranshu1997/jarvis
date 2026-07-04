import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended } from "@/lib/player-settings-extended";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { svg: "" };
    await withGameState((state) => {
      const calendar = getExtended(state.profile).activity_calendar ?? {};
      const dates = Object.keys(calendar).sort().slice(-84);
      const maxXp = Math.max(1, ...dates.map((d) => calendar[d]?.total_xp ?? 0));

      const cell = 12;
      const gap = 2;
      const cols = 12;
      const rows = Math.ceil(dates.length / cols);
      const w = cols * (cell + gap);
      const h = rows * (cell + gap) + 20;

      const rects = dates.map((date, i) => {
        const xp = calendar[date]?.total_xp ?? 0;
        const intensity = xp / maxXp;
        const g = Math.round(100 + intensity * 155);
        const x = (i % cols) * (cell + gap);
        const y = Math.floor(i / cols) * (cell + gap) + 20;
        return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="rgb(0,${g},${Math.round(g * 0.8)})" opacity="${0.3 + intensity * 0.7}"><title>${date}: ${xp} XP</title></rect>`;
      });

      holder.svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><text x="0" y="14" fill="#67e8f9" font-size="10" font-family="monospace">Forge Activity</text>${rects.join("")}</svg>`;
    });

    return new NextResponse(holder.svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
