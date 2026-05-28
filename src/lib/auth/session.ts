import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./config";
import { getSession } from "@/lib/local/sessions";
import { findUserById } from "@/lib/local/store";
import type { SessionUser } from "@/lib/local/types";

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function getLocalSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await getSession(token);
  if (!session) return null;

  const user = await findUserById(session.userId);
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    profile: user.game_state.profile,
  };
}
