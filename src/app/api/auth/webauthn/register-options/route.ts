import { NextResponse } from "next/server";
import {
  generateRegistrationOptions,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { getLocalSessionUser } from "@/lib/auth/session";
import { findUserById, saveUser } from "@/lib/local/store";
import { getWebAuthnConfig } from "@/lib/auth/config";

export async function POST() {
  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { rpName, rpID } = getWebAuthnConfig();

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.username,
    userDisplayName: user.display_name,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "required",
    },
    excludeCredentials: user.webauthn_credentials.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransportFuture[] | undefined,
    })),
  });

  user.webauthn_challenge = options.challenge;
  await saveUser(user);

  return NextResponse.json(options);
}
