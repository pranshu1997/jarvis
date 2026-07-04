"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlayerSettings } from "@/lib/player-settings";
import type { DashboardStats } from "@/types/database";

interface StreakShieldPanelProps {
  stats: DashboardStats;
  compact?: boolean;
}

export function StreakShieldPanel({ stats, compact = false }: StreakShieldPanelProps) {
  const settings = getPlayerSettings(stats.profile);
  const perWeek = settings.streak_shields_per_week ?? 1;
  const used = settings.streak_shields_used ?? 0;
  const remaining = Math.max(0, perWeek - used);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-cyan-400/70">
        {Array.from({ length: perWeek }).map((_, i) => (
          <Shield
            key={i}
            className={cn(
              "w-3.5 h-3.5 transition-opacity",
              i < remaining ? "text-cyan-400 opacity-100" : "text-cyan-400/20 opacity-40"
            )}
            fill={i < remaining ? "currentColor" : "none"}
          />
        ))}
        <span className="font-mono ml-0.5">{remaining}/{perWeek}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-200">Streak Shields</span>
        </div>
        <span className="text-xs font-mono text-cyan-400/60">
          {remaining} of {perWeek} remaining
        </span>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: perWeek }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-lg border py-2 flex flex-col items-center gap-1 transition-all",
              i < remaining
                ? "border-cyan-400/40 bg-cyan-400/10"
                : "border-cyan-400/10 bg-cyan-400/5 opacity-50"
            )}
          >
            <Shield
              className={cn(
                "w-5 h-5",
                i < remaining ? "text-cyan-400" : "text-cyan-400/30"
              )}
              fill={i < remaining ? "currentColor" : "none"}
            />
            <span className="text-[9px] font-mono text-cyan-400/50 uppercase tracking-wider">
              {i < remaining ? "ready" : "used"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-cyan-500/40 leading-relaxed">
        Use shields to skip a habit without breaking your streak. Resets weekly.
      </p>
    </div>
  );
}
