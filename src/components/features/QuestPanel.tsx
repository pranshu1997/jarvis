"use client";

import { HolographicCard } from "@/components/shared/HolographicCard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { QuestCountdown } from "@/components/features/QuestCountdown";
import type { Quest } from "@/types/database";

const TYPE_COLORS: Record<string, string> = {
  daily: "text-cyan-400 border-cyan-500/30",
  weekly: "text-purple-400 border-purple-500/30",
  main: "text-amber-400 border-amber-500/30",
  side: "text-green-400 border-green-500/30",
  dungeon: "text-red-400 border-red-500/30",
};

interface QuestPanelProps {
  quests: Quest[];
  compact?: boolean;
}

export function QuestPanel({ quests, compact = false }: QuestPanelProps) {
  const sorted = [...quests].sort((a, b) => {
    if (a.expires_at && b.expires_at) {
      return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
    }
    if (a.expires_at) return -1;
    if (b.expires_at) return 1;
    return 0;
  });

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {sorted.map((quest, i) => {
        const percent = Math.round(
          (quest.current_count / quest.target_count) * 100
        );
        return (
          <HolographicCard key={quest.id} delay={i * 0.08}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-mono",
                    TYPE_COLORS[quest.quest_type]
                  )}
                >
                  {quest.quest_type}
                </span>
                <h4 className="font-medium text-cyan-50 mt-2">{quest.title}</h4>
                {quest.description && !compact && (
                  <p className="text-xs text-cyan-500/50 mt-1">
                    {quest.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-mono text-cyan-400 whitespace-nowrap">
                  +{quest.xp_reward} XP
                </span>
                <QuestCountdown quest={quest} />
              </div>
            </div>
            <Progress value={percent} className="h-1.5" />
            <p className="text-[10px] text-cyan-500/40 mt-1 font-mono">
              {quest.current_count} / {quest.target_count}
            </p>
          </HolographicCard>
        );
      })}
    </div>
  );
}
