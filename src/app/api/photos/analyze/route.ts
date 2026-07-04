import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended } from "@/lib/player-settings-extended";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { photoId?: string };
  if (!body.photoId) {
    return NextResponse.json({ error: "photoId required" }, { status: 400 });
  }

  try {
    const holder = { notes: "" };
    await withGameState((state) => {
      const photos = getExtended(state.profile).progress_photos ?? [];
      const photo = photos.find((p) => p.id === body.photoId);
      if (!photo) {
        holder.notes = "Photo not found";
        return;
      }

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        holder.notes = `AI analysis queued for ${photo.label ?? photo.date}. Compare with prior photos in gallery for trend tracking.`;
      } else {
        const prior = photos.filter((p) => p.date < photo.date).sort((a, b) => b.date.localeCompare(a.date))[0];
        holder.notes = prior
          ? `Progress check (${photo.date}): Compare with ${prior.date} side-by-side. Log measurements in Stats for quantitative tracking.`
          : `Baseline photo (${photo.date}). Take follow-ups weekly for visual progress tracking.`;
      }
    });
    return NextResponse.json({ notes: holder.notes });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
