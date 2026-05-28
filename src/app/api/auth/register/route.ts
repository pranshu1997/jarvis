import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  isLocalAuthMode,
} from "@/lib/auth/config";
import { createSession } from "@/lib/local/sessions";
import { createInitialGameState } from "@/lib/local/game-state";
import { saveUser, usernameExists } from "@/lib/local/store";
import type { LocalUserRecord } from "@/lib/local/types";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local auth disabled" }, { status: 400 });
  }

  const body = await request.json();
  const username = (body.username as string)?.trim().toLowerCase();
  const password = body.password as string;
  const displayName = (body.displayName as string)?.trim() || username;

  if (!username || username.length < 3) {
    return NextResponse.json(
      { error: "Username must be at least 3 characters" },
      { status: 400 }
    );
  }

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json(
      { error: "Username: lowercase letters, numbers, underscore only" },
      { status: 400 }
    );
  }

  if (await usernameExists(username)) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const id = randomUUID();
  const password_hash = await hashPassword(password);
  const game_state = createInitialGameState(id, displayName);

  const user: LocalUserRecord = {
    id,
    username,
    display_name: displayName,
    password_hash,
    webauthn_credentials: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    game_state,
  };

  await saveUser(user);

  const token = await createSession(id, username);
  const response = NextResponse.json({
    user: {
      id,
      username,
      display_name: displayName,
      profile: game_state.profile,
    },
  });

  response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return response;
}
