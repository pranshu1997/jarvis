import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { buildMonthlyReport } from "@/lib/reports-monthly";

export async function GET(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "markdown";

  try {
    const holder = { report: "" };
    await withGameState((state) => {
      holder.report = buildMonthlyReport(state);
    });

    if (format === "json") {
      return NextResponse.json({ report: holder.report });
    }
    return new NextResponse(holder.report, {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
