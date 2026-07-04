"use client";

import { useGameStore } from "@/stores/game-store";
import { AlertTriangle } from "lucide-react";

export function ComboWarningBanner() {
  const cw = useGameStore((s) => (s.stats?.meta as { comboWarning?: { warn: boolean; combo: number; incomplete: number } })?.comboWarning);
  if (!cw?.warn) return null;

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 flex items-center gap-3">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
      <p className="text-xs text-red-200">
        ×{cw.combo} combo at risk — {cw.incomplete} habit{cw.incomplete > 1 ? "s" : ""} left tonight
      </p>
    </div>
  );
}
