import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { LocalUserRecord, UsersDatabase } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readUsersDb(): Promise<UsersDatabase> {
  await ensureDataDir();
  try {
    const raw = await readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw) as UsersDatabase;
  } catch {
    return { users: [] };
  }
}

export async function writeUsersDb(db: UsersDatabase): Promise<void> {
  await ensureDataDir();
  await writeFile(USERS_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export async function findUserByUsername(
  username: string
): Promise<LocalUserRecord | null> {
  const db = await readUsersDb();
  const normalized = username.trim().toLowerCase();
  return (
    db.users.find((u) => u.username.toLowerCase() === normalized) ?? null
  );
}

export async function findUserById(id: string): Promise<LocalUserRecord | null> {
  const db = await readUsersDb();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function saveUser(user: LocalUserRecord): Promise<void> {
  const db = await readUsersDb();
  const idx = db.users.findIndex((u) => u.id === user.id);
  user.updated_at = new Date().toISOString();
  if (idx >= 0) {
    db.users[idx] = user;
  } else {
    db.users.push(user);
  }
  await writeUsersDb(db);
}

export async function usernameExists(username: string): Promise<boolean> {
  return !!(await findUserByUsername(username));
}
