/** Same-origin fetch that always sends session cookies. */
export async function jarvisFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("jarvis-unauthorized"));
  }

  return res;
}
