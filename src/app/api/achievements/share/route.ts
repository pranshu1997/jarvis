import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function GET(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "rank";
  const rank = searchParams.get("rank") ?? "S";
  const achievement = searchParams.get("achievement") ?? "Perfect Week";

  try {
    let holder = { rank: "", achievement: "" };
    await withGameState((state) => {
      holder = { rank: state.profile.rank, achievement };
    });

    const displayRank = type === "rank" ? rank : holder.rank;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0e7490"/><stop offset="100%" stop-color="#164e63"/></linearGradient></defs>
      <rect width="400" height="220" rx="16" fill="url(#g)"/>
      <text x="200" y="50" text-anchor="middle" fill="#67e8f9" font-size="14" font-family="monospace">JARVIS HUNTER DOSSIER</text>
      <text x="200" y="100" text-anchor="middle" fill="#ecfeff" font-size="48" font-weight="bold" font-family="system-ui">${displayRank}-RANK</text>
      <text x="200" y="140" text-anchor="middle" fill="#a5f3fc" font-size="16" font-family="system-ui">${achievement}</text>
      <text x="200" y="190" text-anchor="middle" fill="#67e8f9" font-size="11" font-family="monospace">jarvis.evolution</text>
    </svg>`;

    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
