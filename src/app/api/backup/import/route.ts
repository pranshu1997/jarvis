import { NextResponse } from "next/server";
import { getLocalSessionUser } from "@/lib/auth/session";
import { findUserById, saveUser } from "@/lib/local/store";
import type { LocalUserRecord } from "@/lib/local/types";

export async function POST(request: Request) {
  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const imported = body as LocalUserRecord;

  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!imported.game_state?.habits || !imported.game_state?.profile) {
    return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });
  }

  user.game_state = imported.game_state;
  user.display_name = imported.display_name ?? user.display_name;
  await saveUser(user);

  return NextResponse.json({ success: true });
}
