import { NextResponse } from "next/server";
import { logMeal, getTodayMacros, getMacroTargets } from "@/lib/macros";
import { patchExtended } from "@/lib/player-settings-extended";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();

  try {
    let today = null;
    await withGameState((state) => {
      today = logMeal(state, {
        protein: Number(body.protein) || 0,
        carbs: Number(body.carbs) || 0,
        fat: Number(body.fat) || 0,
        calories: Number(body.calories) || 0,
      });
    });
    return NextResponse.json({ success: true, today });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let today = null;
    let targets = null;
    await withGameState((state) => {
      today = getTodayMacros(state);
      targets = getMacroTargets(state);
    });
    return NextResponse.json({ today, targets });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function PATCH(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();

  try {
    await withGameState((state) => {
      patchExtended(state.profile, {
        macro_targets: {
          protein: Number(body.protein) || 150,
          carbs: Number(body.carbs) || 200,
          fat: Number(body.fat) || 65,
          calories: Number(body.calories) || 2200,
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
