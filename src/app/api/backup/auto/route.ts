import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isLocalAuthMode } from "@/lib/auth/config";
import { getLocalSessionUser } from "@/lib/auth/session";
import { findUserById } from "@/lib/local/store";

const BACKUPS_DIR = path.join(process.cwd(), "data", "backups");
const MAX_AUTO_BACKUPS = 7;

async function pruneOldBackups(username: string): Promise<void> {
  const { readdir, unlink } = await import("fs/promises");
  try {
    const files = await readdir(BACKUPS_DIR);
    const mine = files
      .filter((f) => f.startsWith(`auto-${username}-`) && f.endsWith(".json"))
      .sort();
    // Keep newest MAX_AUTO_BACKUPS-1 before adding the new one
    const toDelete = mine.slice(0, Math.max(0, mine.length - MAX_AUTO_BACKUPS + 1));
    await Promise.all(toDelete.map((f) => unlink(path.join(BACKUPS_DIR, f))));
  } catch {
    /* ignore */
  }
}

export async function POST() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await mkdir(BACKUPS_DIR, { recursive: true });
  await pruneOldBackups(user.username);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `auto-${user.username}-${timestamp}.json`;
  const filepath = path.join(BACKUPS_DIR, filename);

  await writeFile(filepath, JSON.stringify(user, null, 2), "utf-8");

  return NextResponse.json({
    success: true,
    filename,
    savedAt: new Date().toISOString(),
  });
}
