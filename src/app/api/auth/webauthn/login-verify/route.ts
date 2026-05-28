import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth/config";
import { createSession } from "@/lib/local/sessions";
import { findUserByUsername, saveUser } from "@/lib/local/store";
import { getWebAuthnConfig } from "@/lib/auth/config";

export async function POST(request: Request) {
  const body = await request.json();
  const username = (body.username as string)?.trim().toLowerCase();
  const credentialResponse = body.credential;

  if (!username || !credentialResponse) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await findUserByUsername(username);
  if (!user || !user.webauthn_challenge) {
    return NextResponse.json({ error: "Login expired" }, { status: 400 });
  }

  const stored = user.webauthn_credentials.find(
    (c) => c.id === credentialResponse.id
  );
  if (!stored) {
    return NextResponse.json({ error: "Credential not found" }, { status: 401 });
  }

  const { rpID, origin } = getWebAuthnConfig();

  try {
    const verification = await verifyAuthenticationResponse({
      response: credentialResponse,
      expectedChallenge: user.webauthn_challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: stored.id,
        publicKey: Buffer.from(stored.publicKey, "base64url"),
        counter: stored.counter,
        transports: stored.transports,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: 401 });
    }

    stored.counter = verification.authenticationInfo.newCounter;
    user.webauthn_challenge = undefined;
    await saveUser(user);

    const token = await createSession(user.id, user.username);
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        profile: user.game_state.profile,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 400 }
    );
  }
}
