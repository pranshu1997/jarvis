"use client";

import { useGameStore } from "@/stores/game-store";

export function DeloadWeekBanner() {
  const suggested = useGameStore((s) => (s.stats?.meta as { deloadSuggested?: boolean })?.deloadSuggested);
  if (!suggested) return null;

  return (
    <div className="rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-2 text-xs text-purple-200">
      Recovery pattern detected — consider a deload week (lighter habits / 70% training load)
    </div>
  );
}
