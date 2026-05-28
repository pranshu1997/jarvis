import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth/config";
import { DEMO_COOKIE, DEMO_COOKIE_OPTIONS } from "@/lib/auth/demo";
import { resetDemoModeState } from "@/lib/demo-session";
import { deleteSession } from "@/lib/local/sessions";
import { getSessionToken } from "@/lib/auth/session";

export async function POST() {
  const token = await getSessionToken();
  if (token) await deleteSession(token);

  resetDemoModeState();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
  response.cookies.set(DEMO_COOKIE, "", { ...DEMO_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
