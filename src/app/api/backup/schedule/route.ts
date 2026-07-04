import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { schedule: null as { enabled: boolean; hour: number; path?: string } | null };
    await withGameState((state) => {
      holder.schedule = getExtended(state.profile).backup_schedule ?? { enabled: false, hour: 3 };
    });
    return NextResponse.json({ schedule: holder.schedule });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as {
    enabled?: boolean;
    hour?: number;
    path?: string;
  };

  try {
    await withGameState((state) => {
      const current = getExtended(state.profile).backup_schedule ?? { enabled: false, hour: 3 };
      patchExtended(state.profile, {
        backup_schedule: {
          enabled: body.enabled ?? current.enabled,
          hour: body.hour ?? current.hour,
          path: body.path ?? current.path ?? "~/Documents/Jarvis/",
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
