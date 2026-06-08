import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isExternalAuthorized, externalUnauthorized } from "@/lib/auth/external";
import { isLocalAuthMode } from "@/lib/auth/config";
import { readUsersDb, saveUser } from "@/lib/local/store";
import { levelFromXp } from "@/lib/xp-engine";

/**
 * External XP award endpoint — lets the rest of the Personal OS (Janus
 * completing a task, the Mind router classifying a habit capture, etc.)
 * grant XP without going through Forge's own UI, closing the
 * intention -> XP loop the spec calls for. Single-user app: no session,
 * just the FORGE_API_TOKEN shared secret (see lib/auth/external.ts).
 *
 * No streak/combo/momentum multipliers here on purpose — those describe
 * Forge's own habit-tracking cadence and don't make sense for an
 * externally-sourced, one-off award. `amount` is the final XP, full stop.
 */
export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }
  if (!isExternalAuthorized(request)) {
    return externalUnauthorized();
  }

  const body = await request.json().catch(() => null) as {
    amount?: number;
    reason?: string;
    source?: string;
    entityType?: string;
    entityId?: string;
  } | null;

  const amount = Math.round(Number(body?.amount));
  const reason = (body?.reason ?? "").trim();
  const source = (body?.source ?? "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }
  if (!reason || !source) {
    return NextResponse.json({ error: "reason and source are required" }, { status: 400 });
  }

  const db = await readUsersDb();
  const user = db.users[0];
  if (!user) {
    return NextResponse.json({ error: "no local user to award XP to" }, { status: 404 });
  }

  const state = user.game_state;
  const previousLevel = state.profile.player_level;

  state.profile.total_xp += amount;
  state.profile.player_level = levelFromXp(state.profile.total_xp);

  if (!state.recentXpEvents) state.recentXpEvents = [];
  state.recentXpEvents = [
    {
      id: randomUUID(),
      user_id: user.id,
      entity_type: body?.entityType ?? source,
      entity_id: body?.entityId ?? null,
      base_xp: amount,
      final_xp: amount,
      streak_multiplier: 1,
      combo_multiplier: 1,
      consistency_multiplier: 1,
      momentum_multiplier: 1,
      bonus_multiplier: 1,
      reason: `${reason} (via ${source})`,
      metadata: { source },
      created_at: new Date().toISOString(),
    },
    ...state.recentXpEvents,
  ].slice(0, 100);

  await saveUser(user);

  const playerLevel = state.profile.player_level;
  return NextResponse.json({
    success: true,
    xpEarned: amount,
    previousLevel,
    playerLevel,
    leveledUp: playerLevel > previousLevel,
  });
}
