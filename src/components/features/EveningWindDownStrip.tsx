"use client";

import { useGameStore } from "@/stores/game-store";
import { Moon, Sparkles } from "lucide-react";

export function EveningWindDownStrip() {
  const stats = useGameStore((s) => s.stats);
  const hour = new Date().getHours();
  if (!stats || hour < 17 || hour >= 23) return null;

  const dc = stats.dailyCompletion;
  const incomplete = stats.habits.filter((h) => h.is_active && !h.completed_today);
  if (incomplete.length === 0) return null;

  const intention = (stats.meta as { todayIntention?: string })?.todayIntention;

  return (
    <div className="rounded-xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/40 to-slate-950/40 p-4 space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-indigo-400/60 flex items-center gap-1">
        <Moon className="w-3.5 h-3.5" /> Evening protocol
      </p>
      <p className="text-sm text-indigo-100">
        {incomplete.length} habit{incomplete.length > 1 ? "s" : ""} left before wind-down
      </p>
      {intention && (
        <p className="text-xs text-indigo-300/60 italic flex items-start gap-1">
          <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
          Remember: {intention}
        </p>
      )}
      {dc && (
        <p className="text-[10px] font-mono text-indigo-400/50">
          {dc.completed_habits}/{dc.total_habits} complete · {Math.round((dc.completed_habits / Math.max(1, dc.total_habits)) * 100)}%
        </p>
      )}
    </div>
  );
}
