import { NextResponse } from "next/server";
import { getLocalSessionUser } from "@/lib/auth/session";
import { isLocalAuthMode } from "@/lib/auth/config";
import { isDemoMode } from "@/lib/auth/demo";
import { findUserById } from "@/lib/local/store";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ authenticated: false, localMode: false });
  }

  if (await isDemoMode()) {
    return NextResponse.json({
      authenticated: true,
      localMode: true,
      demo: true,
      user: { username: "demo", display_name: "Demo Hunter" },
    });
  }

  const user = await getLocalSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, localMode: true });
  }

  const record = await findUserById(user.id);

  return NextResponse.json({
    authenticated: true,
    localMode: true,
    user: {
      ...user,
      hasBiometric: (record?.webauthn_credentials.length ?? 0) > 0,
    },
  });
}
