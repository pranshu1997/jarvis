import { type NextRequest, NextResponse } from "next/server";
import { detectPlatform } from "@/lib/device";

const PUBLIC_PATHS = ["/", "/auth/callback"];

function isLocalMode(): boolean {
  if (process.env.JARVIS_LOCAL_AUTH === "false") return false;
  if (process.env.JARVIS_LOCAL_AUTH === "true") return true;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/manifest") ||
    pathname.includes(".")
  ) {
    // Still handle platform redirects for authenticated app access
    if (!pathname.startsWith("/app")) {
      return NextResponse.next();
    }
  }

  if (isLocalMode() && pathname.startsWith("/app")) {
    const session = request.cookies.get("jarvis_session");
    const demo = request.cookies.get("jarvis_demo");
    if (!session?.value && demo?.value !== "1") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname === "/app" || pathname === "/app/") {
    const platform = detectPlatform(
      request.headers.get("user-agent") ?? undefined
    );
    return NextResponse.redirect(
      new URL(`/app/${platform}/dashboard`, request.url)
    );
  }

  if (
    pathname.startsWith("/app/") &&
    !pathname.includes("/desktop/") &&
    !pathname.includes("/mobile/")
  ) {
    const platform = detectPlatform(
      request.headers.get("user-agent") ?? undefined
    );
    const rest = pathname.replace("/app/", "");
    return NextResponse.redirect(
      new URL(`/app/${platform}/${rest}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|sw.js|workbox).*)"],
};
