import { type NextRequest, NextResponse } from "next/server";
import { detectPlatform } from "@/lib/device";

const PUBLIC_PATHS = ["/", "/auth/callback", "/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/manifest") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname === "/app" || pathname === "/app/") {
    const platform = detectPlatform(
      request.headers.get("user-agent") ?? undefined
    );
    return NextResponse.redirect(
      new URL(`/app/${platform}/dashboard`, request.url)
    );
  }

  if (pathname.startsWith("/app/") && !pathname.includes("/desktop/") && !pathname.includes("/mobile/")) {
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
