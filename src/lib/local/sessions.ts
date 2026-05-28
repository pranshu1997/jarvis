import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { SessionRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

type SessionsDatabase = {
  sessions: Record<string, SessionRecord>;
};

let cache: SessionsDatabase | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function loadDb(): Promise<SessionsDatabase> {
  if (cache) return cache;
  await ensureDataDir();
  try {
    const raw = await readFile(SESSIONS_FILE, "utf-8");
    cache = JSON.parse(raw) as SessionsDatabase;
  } catch {
    cache = { sessions: {} };
  }
  if (!cache.sessions) cache.sessions = {};
  return cache;
}

async function flushDb(): Promise<void> {
  const db = cache ?? { sessions: {} };
  await ensureDataDir();
  await writeFile(SESSIONS_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function schedulePersist(): void {
  writeChain = writeChain.then(() => flushDb());
}

export async function createSession(
  userId: string,
  username: string
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const db = await loadDb();
  db.sessions[token] = {
    userId,
    username,
    createdAt: Date.now(),
  };
  schedulePersist();
  await writeChain;
  return token;
}

export async function getSession(token: string): Promise<SessionRecord | null> {
  const db = await loadDb();
  return db.sessions[token] ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  const db = await loadDb();
  delete db.sessions[token];
  schedulePersist();
  await writeChain;
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  const db = await loadDb();
  for (const [token, session] of Object.entries(db.sessions)) {
    if (session.userId === userId) delete db.sessions[token];
  }
  schedulePersist();
  await writeChain;
}
