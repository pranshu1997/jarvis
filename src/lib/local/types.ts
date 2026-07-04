import type { DashboardStats, Profile } from "@/types/database";

export interface WebAuthnCredentialRecord {
  id: string;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransport[];
}

export interface LocalUser {
  id: string;
  username: string;
  display_name: string;
  /** Legacy bcrypt hash; prefer salt_b64 + hash_b64 (Nexus-compatible PBKDF2). */
  password_hash: string | null;
  salt_b64?: string | null;
  hash_b64?: string | null;
  webauthn_credentials: WebAuthnCredentialRecord[];
  webauthn_challenge?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalUserRecord extends LocalUser {
  game_state: DashboardStats;
}

export interface UsersDatabase {
  users: LocalUserRecord[];
}

export interface SessionRecord {
  userId: string;
  username: string;
  createdAt: number;
}

export type SessionUser = Pick<LocalUser, "id" | "username" | "display_name"> & {
  profile: Profile;
};
