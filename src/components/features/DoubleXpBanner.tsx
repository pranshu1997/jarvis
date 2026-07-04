"use client";

import { useGameStore } from "@/stores/game-store";
import { doubleXpLabel, isDoubleXpActive } from "@/lib/double-xp";
import { Zap } from "lucide-react";

export function DoubleXpBanner() {
  const meta = useGameStore((s) => s.stats?.meta as { doubleXp?: boolean } | undefined);
  const active = meta?.doubleXp ?? isDoubleXpActive();
  if (!active) return null;

  return (
    <div className="mx-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 flex items-center gap-2">
      <Zap className="w-4 h-4 text-yellow-400" />
      <p className="text-xs font-semibold text-yellow-200">{doubleXpLabel()}</p>
    </div>
  );
}
