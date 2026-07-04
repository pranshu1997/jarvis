import { type NextRequest, NextResponse } from "next/server";
import { detectPlatform } from "@/lib/device";

const PUBLIC_PREFIXES = ["/", "/login", "/api/auth", "/auth/callback"];

function isLocalMode(): boolean {
  if (process.env.JARVIS_LOCAL_AUTH === "false") return false;
  if (process.env.JARVIS_LOCAL_AUTH === "true") return true;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    if (!pathname.startsWith("/app")) {
      return NextResponse.next();
    }
  }

  if (isLocalMode()) {
    if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      if (!pathname.startsWith("/app")) {
        return NextResponse.next();
      }
    }

    const session = request.cookies.get("jarvis_session");
    const authed = !!session?.value;

    if (!authed) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (pathname.startsWith("/app")) {
        const homeUrl = new URL("/", request.url);
        homeUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(homeUrl);
      }
    }
  } else if (
    pathname.startsWith("/api/") ||
    pathname === "/" ||
    pathname.startsWith("/auth/")
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
