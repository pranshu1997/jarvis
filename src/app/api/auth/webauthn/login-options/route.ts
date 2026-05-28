import { NextResponse } from "next/server";
import {
  generateAuthenticationOptions,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { findUserByUsername, saveUser } from "@/lib/local/store";
import { getWebAuthnConfig } from "@/lib/auth/config";

export async function POST(request: Request) {
  const body = await request.json();
  const username = (body.username as string)?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const user = await findUserByUsername(username);
  if (!user || user.webauthn_credentials.length === 0) {
    return NextResponse.json(
      { error: "No biometric login set up for this user" },
      { status: 404 }
    );
  }

  const { rpID } = getWebAuthnConfig();

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: user.webauthn_credentials.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransportFuture[] | undefined,
    })),
  });

  user.webauthn_challenge = options.challenge;
  await saveUser(user);

  return NextResponse.json(options);
}
