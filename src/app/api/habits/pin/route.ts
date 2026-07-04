import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { habitId, pinned } = (await req.json()) as {
      habitId: string;
      pinned: boolean;
    };

    if (!habitId) {
      return NextResponse.json({ error: "habitId required" }, { status: 400 });
    }

    return NextResponse.json({ success: true, habitId, pinned });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
