import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  isLocalAuthMode,
} from "@/lib/auth/config";
import { verifyTouchId } from "@/lib/auth/touch-id";
import { DEMO_COOKIE, DEMO_COOKIE_OPTIONS } from "@/lib/auth/demo";
import { resetDemoModeState } from "@/lib/demo-session";
import { createSession } from "@/lib/local/sessions";
import { findUserByUsername } from "@/lib/local/store";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local auth disabled" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const username = ((body.username as string) ?? "pranshu").trim().toLowerCase();

  const user = await findUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const touch = await verifyTouchId(username);
  if (!touch.ok) {
    return NextResponse.json({ error: touch.error }, { status: 401 });
  }

  resetDemoModeState();
  const token = await createSession(user.id, user.username);
  const response = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      profile: user.game_state.profile,
      hasBiometric: user.webauthn_credentials.length > 0,
    },
  });

  response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  response.cookies.set(DEMO_COOKIE, "", { ...DEMO_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
