import { cookies } from "next/headers";

export const DEMO_COOKIE = "jarvis_demo";

export const DEMO_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24h demo session
};

export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE)?.value === "1";
}
