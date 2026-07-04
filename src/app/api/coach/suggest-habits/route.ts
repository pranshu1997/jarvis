import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { categoryBalance } from "@/lib/analytics-correlation";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { suggestions: [] as { title: string; category: string; reason: string }[] };
    await withGameState((state) => {
      const balance = categoryBalance(state);
      const weakest = Object.entries(balance).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "physical";
      const stalling = state.categories.find((c) => c.slug === weakest);
      holder.suggestions = [
        {
          title: `Daily ${weakest} check-in`,
          category: weakest,
          reason: `${weakest} is your lowest pillar at ${balance[weakest] ?? 0}%`,
        },
        {
          title: "Evening reflection",
          category: "awareness",
          reason: "Boosts perfect-day correlation",
        },
        {
          title: "10-min mobility",
          category: "physical",
          reason: stalling ? `${stalling.name} level ${stalling.level} — needs XP` : "Maintain physical momentum",
        },
      ];
    });
    return NextResponse.json({ suggestions: holder.suggestions });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
