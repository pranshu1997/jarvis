export const SESSION_COOKIE = "jarvis_session";

export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SEC,
};

export function isLocalAuthMode(): boolean {
  if (process.env.JARVIS_LOCAL_AUTH === "false") return false;
  if (process.env.JARVIS_LOCAL_AUTH === "true") return true;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getWebAuthnConfig() {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL(origin);
  return {
    rpName: "Forge",
    rpID: url.hostname === "localhost" ? "localhost" : url.hostname,
    origin,
  };
}
