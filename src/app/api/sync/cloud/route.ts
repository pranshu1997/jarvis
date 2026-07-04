import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { lastSynced: null as string | null, configured: isSupabaseConfigured() };
    await withGameState((state) => {
      holder.lastSynced = getExtended(state.profile).last_synced_at ?? null;
    });
    return NextResponse.json({
      configured: holder.configured,
      last_synced_at: holder.lastSynced,
      message: holder.configured
        ? "Supabase configured — full sync coming soon"
        : "Local-first mode — cloud sync requires Supabase env vars",
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function POST() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      message: "Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and keys",
    });
  }

  try {
    await withGameState((state) => {
      patchExtended(state.profile, { last_synced_at: new Date().toISOString() });
    });
    return NextResponse.json({ success: true, message: "Sync timestamp updated (stub)" });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
