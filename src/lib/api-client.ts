/** Same-origin fetch that always sends session cookies. */
import { fetchWithOfflineQueue } from "@/lib/offline-queue";

export async function jarvisFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const method = (init?.method ?? "GET").toUpperCase();
  const url = typeof input === "string" ? input : input.toString();

  const doFetch = async (): Promise<Response> => {
    if (typeof window !== "undefined" && method !== "GET") {
      return fetchWithOfflineQueue(url, {
        ...init,
        credentials: "include",
        headers,
      });
    }
    return fetch(input, {
      ...init,
      credentials: "include",
      headers,
    });
  };

  const res = await doFetch();

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("jarvis-unauthorized"));
  }

  return res;
}
