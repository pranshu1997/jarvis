import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { processHealthImport } from "@/lib/health-sync";
import type { HealthImportPayload } from "@/lib/health-sync";

/** Accept Google Fit / Health Connect export shape */
export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as {
    fitnessData?: { date?: string; steps?: number; sleep_hours?: number; hrv?: number; weight_kg?: number }[];
    date?: string;
    steps?: number;
    sleep_hours?: number;
    hrv?: number;
    weight_kg?: number;
  };

  const entries = body.fitnessData?.length
    ? body.fitnessData
    : [{ date: body.date, steps: body.steps, sleep_hours: body.sleep_hours, hrv: body.hrv, weight_kg: body.weight_kg }];

  try {
    const results: unknown[] = [];
    await withGameState((state) => {
      for (const entry of entries) {
        const date = entry.date ?? new Date().toISOString().slice(0, 10);
        const payload: HealthImportPayload = {
          date,
          steps: typeof entry.steps === "number" ? entry.steps : undefined,
          sleep_hours: typeof entry.sleep_hours === "number" ? entry.sleep_hours : undefined,
          hrv: typeof entry.hrv === "number" ? entry.hrv : undefined,
          weight_kg: typeof entry.weight_kg === "number" ? entry.weight_kg : undefined,
        };
        results.push(processHealthImport(state, payload));
      }
    });
    return NextResponse.json({ success: true, imported: results.length, results });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
