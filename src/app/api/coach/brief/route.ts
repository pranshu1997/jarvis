import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { buildStatsSummary } from "@/lib/coach-insights";
import { categoryBalance } from "@/lib/analytics-correlation";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { brief: "" };
    await withGameState((state) => {
      const summary = buildStatsSummary(state);
      const balance = categoryBalance(state);
      const weakest = Object.entries(balance).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "physical";
      const strongest = Object.entries(balance).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "physical";

      holder.brief = [
        `# Your Week in 3 Bullets`,
        "",
        `1. **Momentum:** Level ${summary.playerLevel}, ${summary.completedToday}/${summary.totalHabits} habits today.`,
        `2. **Balance:** Strongest pillar is **${strongest}**; **${weakest}** needs attention this week.`,
        `3. **Focus:** Prioritize ${weakest} habits and protect your ${summary.streak}-day streak.`,
      ].join("\n");
    });
    return NextResponse.json({ brief: holder.brief });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
