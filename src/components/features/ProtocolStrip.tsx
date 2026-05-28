"use client";

import { AlertTriangle, Target, Flame } from "lucide-react";
import { HolographicCard } from "@/components/shared/HolographicCard";
import type { DashboardStats, Habit } from "@/types/database";

function priorityScore(h: Habit, hour: number): number {
  let score = 0;
  if (h.current_streak >= 3 && !h.completed_today) score += 50;
  if (!h.completed_today) score += 20;
  if (hour >= 18 && !h.completed_today && h.current_streak > 0) score += 30;
  return score;
}

export function ProtocolStrip({ stats }: { stats: DashboardStats }) {
  const hour = new Date().getHours();
  const incomplete = stats.habits.filter((h) => h.is_active && !h.completed_today);
  const atRisk = incomplete.filter(
    (h) => h.current_streak >= 3 && hour >= 16
  );

  const prioritized = [...incomplete]
    .sort((a, b) => priorityScore(b, hour) - priorityScore(a, hour))
    .slice(0, 5);

  const activeQuests = stats.quests
    .filter((q) => q.status === "active" && q.quest_type === "daily")
    .slice(0, 2);

  return (
    <HolographicCard className="space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-cyan-400" />
        <h3 className="font-display text-sm font-semibold text-cyan-100">
          Today&apos;s Protocol
        </h3>
      </div>

      {atRisk.length > 0 && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/80">
            {atRisk.length} streak{atRisk.length > 1 ? "s" : ""} at risk today — log before midnight
          </p>
        </div>
      )}

      <ul className="space-y-1.5">
        {prioritized.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between text-sm text-cyan-100/80"
          >
            <span className="truncate">{h.name}</span>
            {h.current_streak > 0 && (
              <span className="flex items-center gap-0.5 text-orange-400 text-xs shrink-0 ml-2">
                <Flame className="w-3 h-3" />{h.current_streak}
              </span>
            )}
          </li>
        ))}
      </ul>

      {activeQuests.length > 0 && (
        <div className="pt-2 border-t border-cyan-500/10">
          <p className="text-[10px] uppercase tracking-wider text-cyan-500/40 mb-1">
            Active quests
          </p>
          {activeQuests.map((q) => (
            <p key={q.id} className="text-xs text-cyan-400/70 truncate">
              {q.title} ({q.current_count}/{q.target_count})
            </p>
          ))}
        </div>
      )}
    </HolographicCard>
  );
}
