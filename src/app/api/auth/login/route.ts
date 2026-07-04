import { NextResponse } from "next/server";
import { verifyUserPassword } from "@/lib/auth/verify-user-password";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  isLocalAuthMode,
} from "@/lib/auth/config";
import { createSession } from "@/lib/local/sessions";
import { DEMO_COOKIE, DEMO_COOKIE_OPTIONS } from "@/lib/auth/demo";
import { resetDemoModeState } from "@/lib/demo-session";
import { findUserByUsername } from "@/lib/local/store";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local auth disabled" }, { status: 400 });
  }

  const body = await request.json();
  const username = (body.username as string)?.trim().toLowerCase();
  const password = body.password as string;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const user = await findUserByUsername(username);
  if (
    !user ||
    (!user.password_hash && !(user.salt_b64 && user.hash_b64))
  ) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyUserPassword(user, password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
