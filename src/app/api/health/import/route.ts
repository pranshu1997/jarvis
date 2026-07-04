import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { processHealthImport } from "@/lib/health-sync";
import type { HealthImportPayload } from "@/lib/health-sync";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as Partial<HealthImportPayload>;

  const date = body.date ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format (YYYY-MM-DD)" }, { status: 400 });
  }

  const payload: HealthImportPayload = {
    date,
    steps: typeof body.steps === "number" ? body.steps : undefined,
    sleep_hours: typeof body.sleep_hours === "number" ? body.sleep_hours : undefined,
    hrv: typeof body.hrv === "number" ? body.hrv : undefined,
    weight_kg: typeof body.weight_kg === "number" ? body.weight_kg : undefined,
  };

  try {
    const resultHolder = { value: null as ReturnType<typeof processHealthImport> | null };
    await withGameState((state) => {
      resultHolder.value = processHealthImport(state, payload);
    });

    return NextResponse.json({ success: true, ...resultHolder.value });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
