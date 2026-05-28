import { NextResponse } from "next/server";
import { getLocalSessionUser } from "@/lib/auth/session";
import { findUserById } from "@/lib/local/store";

export async function GET() {
  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(JSON.stringify(user, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="jarvis-backup-${user.username}-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
