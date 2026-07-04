"use client";

import { Calendar } from "lucide-react";

export function CalendarSubscribeButton() {
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/api/calendar/feed`
    : "/api/calendar/feed";

  return (
    <a
      href={url}
      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 rounded-full px-3 py-1.5"
    >
      <Calendar className="w-3.5 h-3.5" />
      Subscribe calendar
    </a>
  );
}
