import { readFile } from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth/password";
import { createInitialGameState } from "@/lib/local/game-state";
import { findUserByUsername, saveUser } from "@/lib/local/store";
import type { LocalUserRecord } from "@/lib/local/types";

const NEXUS_AUTH_FILE = path.join(os.homedir(), "code", "nexus", "data", "auth_users.json");

export async function ensureLocalUserFromNexus(
  username: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, error: "Missing username." };
  }

  if (await findUserByUsername(normalized)) {
    return { ok: true };
  }

  let raw: string;
  try {
    raw = await readFile(NEXUS_AUTH_FILE, "utf-8");
  } catch {
    return { ok: false, error: "Nexus auth store not found." };
  }

  let data: { users?: Array<{ username: string }> };
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid Nexus auth store." };
  }

  const row = data.users?.find(
    (u) => u.username.trim().toLowerCase() === normalized
  );
  if (!row) {
    return { ok: false, error: `User \`${normalized}\` is not registered in Nexus.` };
  }

  const id = randomUUID();
  const displayName = normalized;
  const password_hash = await hashPassword(randomUUID());
  const game_state = createInitialGameState(id, displayName);

  const user: LocalUserRecord = {
    id,
    username: normalized,
    display_name: displayName,
    password_hash,
    webauthn_credentials: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    game_state,
  };

  await saveUser(user);
  return { ok: true };
}
