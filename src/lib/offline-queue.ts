"use client";

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  queuedAt: number;
  attempts: number;
}

const QUEUE_KEY = "jarvis_offline_queue_v1";
const MAX_RETRIES = 5;

function readQueue(): QueuedRequest[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedRequest[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* quota exceeded — drop oldest */
    const trimmed = queue.slice(-20);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  }
}

export function enqueueRequest(
  url: string,
  method: string,
  body: unknown,
  headers: Record<string, string> = {}
): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const queue = readQueue();
  queue.push({
    id,
    url,
    method,
    body: body != null ? JSON.stringify(body) : null,
    headers: { "Content-Type": "application/json", ...headers },
    queuedAt: Date.now(),
    attempts: 0,
  });
  writeQueue(queue);
  return id;
}

export function getQueueLength(): number {
  return readQueue().length;
}

export function clearQueue(): void {
  writeQueue([]);
}

/** Flush queued requests. Returns counts of succeeded/failed replays. */
export async function flushQueue(): Promise<{ succeeded: number; failed: number; remaining: number }> {
  const queue = readQueue();
  if (queue.length === 0) return { succeeded: 0, failed: 0, remaining: 0 };

  const remaining: QueuedRequest[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const req of queue) {
    try {
      const res = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        credentials: "include",
      });
      if (res.ok) {
        succeeded++;
      } else if (res.status >= 400 && res.status < 500) {
        // Client error — discard permanently
        failed++;
      } else {
        // Server error — retry later
        req.attempts++;
        if (req.attempts < MAX_RETRIES) remaining.push(req);
        else failed++;
      }
    } catch {
      req.attempts++;
      if (req.attempts < MAX_RETRIES) remaining.push(req);
      else failed++;
    }
  }

  writeQueue(remaining);
  return { succeeded, failed, remaining: remaining.length };
}

/**
 * Fetch wrapper that enqueues on network failure for later replay.
 */
export async function fetchWithOfflineQueue(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const res = await fetch(url, { credentials: "include", ...options });
    if (res.ok) {
      // Best-effort flush any queued requests now that we're online
      void flushQueue();
    }
    return res;
  } catch (err) {
    const method = (options.method ?? "GET").toUpperCase();
    if (method !== "GET") {
      enqueueRequest(
        url,
        method,
        options.body ? options.body : null,
        (options.headers as Record<string, string>) ?? {}
      );
    }
    throw err;
  }
}
