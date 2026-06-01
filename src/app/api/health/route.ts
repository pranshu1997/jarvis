import { NextResponse } from "next/server";

/** Nexus launcher probe — must stay unauthenticated. */
export async function GET() {
  return NextResponse.json({ ok: true, app: "jarvis" });
}
