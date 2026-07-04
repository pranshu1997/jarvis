import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercise_ids: string[];
  notes?: string;
}

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let templates: WorkoutTemplate[] = [];
    await withGameState((state) => {
      templates = (getExtended(state.profile).workout_templates ?? []) as WorkoutTemplate[];
    });
    return NextResponse.json({ templates });
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

  const body = await request.json();
  const { name, exerciseIds, notes } = body as {
    name: string;
    exerciseIds: string[];
    notes?: string;
  };

  if (!name?.trim() || !exerciseIds?.length) {
    return NextResponse.json({ error: "name and exerciseIds required" }, { status: 400 });
  }

  try {
    let template: WorkoutTemplate | null = null;
    await withGameState((state) => {
      const existing = (getExtended(state.profile).workout_templates ?? []) as WorkoutTemplate[];
      template = {
        id: randomUUID(),
        name: name.trim(),
        exercise_ids: exerciseIds,
        notes,
      };
      patchExtended(state.profile, {
        workout_templates: [...existing, template],
      });
    });
    return NextResponse.json({ template });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function DELETE(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      const existing = (getExtended(state.profile).workout_templates ?? []) as WorkoutTemplate[];
      patchExtended(state.profile, {
        workout_templates: existing.filter((t) => t.id !== id),
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
