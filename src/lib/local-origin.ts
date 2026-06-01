/** Local dev host — must match Nexus launch URLs (127.0.0.1, not localhost). */
export const LOCAL_APP_HOST = "127.0.0.1";

export function localOriginFromRequest(request: Request): string {
  const url = new URL(request.url);
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  return `${url.protocol}//${LOCAL_APP_HOST}:${port}`;
}

/** Plain string URL — avoids Next.js rewriting 127.0.0.1 to localhost. */
export function localAppUrl(
  request: Request,
  pathname: string,
  params?: Record<string, string>
): string {
  const base = localOriginFromRequest(request);
  const url = new URL(pathname, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
