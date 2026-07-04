import { readFile } from "fs/promises";
import path from "path";
import os from "os";
import {
  verifyBcryptPassword,
  verifyPassword,
} from "@/lib/auth/password";
import { findUserByUsername, saveUser } from "@/lib/local/store";
import type { LocalUserRecord } from "@/lib/local/types";

const NEXUS_AUTH_FILE = path.join(
  os.homedir(),
  "code",
  "nexus",
  "data",
  "auth_users.json"
);

async function readNexusAuthRow(
  username: string
): Promise<{ salt_b64: string; hash_b64: string } | null> {
  try {
    const raw = await readFile(NEXUS_AUTH_FILE, "utf-8");
    const data = JSON.parse(raw) as {
      users?: Array<{ username: string; salt_b64?: string; hash_b64?: string }>;
    };
    const row = data.users?.find(
      (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase()
    );
    if (row?.salt_b64 && row?.hash_b64) {
      return { salt_b64: row.salt_b64, hash_b64: row.hash_b64 };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Verify password; upgrade legacy bcrypt users from Nexus PBKDF2 when matched. */
export async function verifyUserPassword(
  user: LocalUserRecord,
  password: string
): Promise<boolean> {
  if (user.salt_b64 && user.hash_b64) {
    return verifyPassword(password, user.salt_b64, user.hash_b64);
  }

  if (user.password_hash) {
    if (await verifyBcryptPassword(password, user.password_hash)) {
      return true;
    }
  }

  const nexusRow = await readNexusAuthRow(user.username);
  if (
    nexusRow &&
    verifyPassword(password, nexusRow.salt_b64, nexusRow.hash_b64)
  ) {
    user.salt_b64 = nexusRow.salt_b64;
    user.hash_b64 = nexusRow.hash_b64;
    user.password_hash = null;
    await saveUser(user);
    return true;
  }

  return false;
}
