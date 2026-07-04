import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth/config";
import { createSession } from "@/lib/local/sessions";
import { findUserByUsername } from "@/lib/local/store";
import { verifyNexusSsoToken } from "@/lib/nexus-sso";
import { ensureLocalUserFromNexus } from "@/lib/nexus-provision";
import { localAppUrl } from "@/lib/local-origin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const verified = await verifyNexusSsoToken(token);
  if (!verified.ok) {
    return NextResponse.redirect(
      localAppUrl(request, "/", {
        from: "nexus",
        sso_error: verified.error,
      })
    );
  }

  const provisioned = await ensureLocalUserFromNexus(verified.username);
  if (!provisioned.ok) {
    return NextResponse.redirect(
      localAppUrl(request, "/", {
        from: "nexus",
        sso_error: provisioned.error,
      })
    );
  }

  const user = await findUserByUsername(verified.username);
  if (!user) {
    return NextResponse.redirect(
      localAppUrl(request, "/", {
        from: "nexus",
        sso_error: "User not found after Nexus provisioning.",
      })
    );
  }

  const sessionToken = await createSession(user.id, user.username);
  const response = NextResponse.redirect(
    localAppUrl(request, "/app/desktop/dashboard")
  );
  response.cookies.set(SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS);
  return response;
}
