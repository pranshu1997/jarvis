export type Platform = "desktop" | "mobile";

export function detectPlatform(userAgent?: string): Platform {
  if (typeof window !== "undefined") {
    return window.innerWidth < 768 ? "mobile" : "desktop";
  }
  const ua = userAgent ?? "";
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  if (mobileRegex.test(ua)) return "mobile";
  return "desktop";
}

export function getAppPath(platform: Platform, path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `/app/${platform}/${clean}`;
}
