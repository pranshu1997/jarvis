import { NextResponse } from "next/server";
import { DEMO_COOKIE, DEMO_COOKIE_OPTIONS } from "@/lib/auth/demo";
import { resetDemoModeState } from "@/lib/demo-session";
import { SESSION_COOKIE } from "@/lib/auth/config";

export async function POST() {
  resetDemoModeState();
  const response = NextResponse.json({ success: true, demo: true });
  response.cookies.set(DEMO_COOKIE, "1", DEMO_COOKIE_OPTIONS);
  response.cookies.set(SESSION_COOKIE, "", { ...DEMO_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}

export async function DELETE() {
  resetDemoModeState();
  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_COOKIE, "", { ...DEMO_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
