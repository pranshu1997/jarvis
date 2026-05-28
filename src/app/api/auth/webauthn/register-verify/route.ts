import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getLocalSessionUser } from "@/lib/auth/session";
import { findUserById, saveUser } from "@/lib/local/store";
import { getWebAuthnConfig } from "@/lib/auth/config";

export async function POST(request: Request) {
  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const user = await findUserById(sessionUser.id);
  if (!user || !user.webauthn_challenge) {
    return NextResponse.json({ error: "Registration expired" }, { status: 400 });
  }

  const { rpID, origin } = getWebAuthnConfig();

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.webauthn_challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const { credential, credentialDeviceType } = verification.registrationInfo;

    user.webauthn_credentials.push({
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: body.response?.transports,
    });
    user.webauthn_challenge = undefined;
    await saveUser(user);

    return NextResponse.json({
      success: true,
      deviceType: credentialDeviceType,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 400 }
    );
  }
}
