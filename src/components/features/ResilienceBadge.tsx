"use client";

import { useGameStore } from "@/stores/game-store";
import { Shield } from "lucide-react";

export function ResilienceBadge() {
  const score = useGameStore((s) => (s.stats?.meta as { resilienceScore?: number })?.resilienceScore) ?? 0;
  if (score === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 border border-purple-500/25 rounded-full px-2 py-0.5">
      <Shield className="w-3 h-3" />
      Resilience {score}
    </span>
  );
}
