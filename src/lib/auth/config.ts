export const SESSION_COOKIE = "jarvis_session";

/** Session cookie with no Max-Age — cleared when the browser/app quits */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
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
    rpName: "Jarvis",
    rpID: url.hostname === "localhost" ? "localhost" : url.hostname,
    origin,
  };
}
