"use client";

import { useGameStore } from "@/stores/game-store";
import { ReadinessStrip } from "@/components/features/ReadinessStrip";
import type { ReadinessEntry } from "@/lib/player-settings-extended";

export function MorningRitualStrip({ onLogged }: { onLogged?: () => void }) {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const hour = new Date().getHours();
  if (hour >= 12) return null;

  const dc = stats.dailyCompletion;
  const pct = dc && dc.total_habits > 0 ? Math.round((dc.completed_habits / dc.total_habits) * 100) : 0;
  const intention = (stats.meta as { todayIntention?: string })?.todayIntention;

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 to-purple-950/20 p-4 space-y-3">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/50">Morning Protocol</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-mono font-bold text-cyan-300">{pct}%</span>
        <span className="text-xs text-cyan-500/50">today complete</span>
      </div>
      {intention && <p className="text-sm text-cyan-200/80 italic">&ldquo;{intention}&rdquo;</p>}
      <ReadinessStrip initial={(stats.meta?.readiness as ReadinessEntry | null) ?? null} onLogged={onLogged ?? (() => {})} />
    </div>
  );
}
