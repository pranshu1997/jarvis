import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { ProgressPhoto } from "@/lib/player-settings-extended";
import { randomUUID } from "crypto";

const MAX_PHOTOS = 20;

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const photosHolder = { value: [] as ProgressPhoto[] };
    await withGameState((state) => {
      photosHolder.value = getExtended(state.profile).progress_photos ?? [];
    });

    return NextResponse.json({ photos: photosHolder.value });
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
    base64?: string;
    mime_type?: string;
    date?: string;
    label?: string;
  };

  if (!body.base64 || !body.mime_type) {
    return NextResponse.json({ error: "base64 and mime_type required" }, { status: 400 });
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(body.mime_type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const newPhoto: ProgressPhoto = {
    id: randomUUID(),
    date: body.date ?? new Date().toISOString().slice(0, 10),
    base64: body.base64,
    mime_type: body.mime_type,
    label: body.label,
    uploaded_at: new Date().toISOString(),
  };

  try {
    const resultHolder = { id: "", total: 0 };
    await withGameState((state) => {
      const ext = getExtended(state.profile);
      const photos = [...(ext.progress_photos ?? []), newPhoto];
      // Keep newest MAX_PHOTOS, dropping oldest
      const trimmed = photos
        .sort((a, b) => a.uploaded_at.localeCompare(b.uploaded_at))
        .slice(-MAX_PHOTOS);
      patchExtended(state.profile, { progress_photos: trimmed });
      resultHolder.id = newPhoto.id;
      resultHolder.total = trimmed.length;
    });

    return NextResponse.json({ success: true, id: resultHolder.id, total: resultHolder.total });
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
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      const ext = getExtended(state.profile);
      const photos = (ext.progress_photos ?? []).filter((p) => p.id !== id);
      patchExtended(state.profile, { progress_photos: photos });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
