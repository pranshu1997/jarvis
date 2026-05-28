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
  password_hash: string | null;
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
