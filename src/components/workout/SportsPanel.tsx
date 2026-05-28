"use client";

import { useState } from "react";
import { HolographicCard } from "@/components/shared/HolographicCard";
import { XpBar } from "@/components/effects/XpBar";
import { RankBadge } from "@/components/shared/RankBadge";
import { Button } from "@/components/ui/button";
import { xpProgressInLevel } from "@/lib/xp-engine";
import type { Sport } from "@/types/database";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

export function SportsPanel({
  sports,
  onLogged,
}: {
  sports: Sport[];
  onLogged: () => void;
}) {
  const [duration, setDuration] = useState("30");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const playable = sports.filter((s) => s.slug !== "overall" && s.is_active);

  const logSession = async (sportId: string) => {
    setLoadingId(sportId);
    try {
      const res = await fetch("/api/sports/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sportId,
          durationMinutes: Number(duration) || 30,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        useToastStore.getState().show(data.error ?? "Failed", "error");
        return;
      }
      if (data.xpEarned > 0) {
        useToastStore.getState().show(
          `+${data.xpEarned} XP — sport session logged`,
          data.leveledUp ? "celebration" : "success"
        );
      } else {
        useToastStore.getState().show("Already logged today", "info");
      }
      onLogged();
    } finally {
      setLoadingId(null);
    }
  };

  const overall = sports.find((s) => s.slug === "overall");

  return (
    <div className="space-y-6">
      {overall && (
        <HolographicCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-cyan-200">
                {overall.name}
              </h3>
              <p className="text-xs text-cyan-500/50">
                {overall.sessions_count} sessions · 🔥{overall.current_streak}
              </p>
            </div>
            <RankBadge rank={overall.rank} />
          </div>
          {(() => {
            const xp = xpProgressInLevel(overall.total_xp, overall.level);
            return (
              <div className="mt-3">
                <XpBar
                  label={`Lv.${overall.level}`}
                  current={xp.current}
                  required={xp.required}
                  percent={xp.percent}
                />
              </div>
            );
          })()}
        </HolographicCard>
      )}

      <div className="flex items-end gap-3">
        <div>
          <label className="text-xs text-cyan-500/50">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="block mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 w-24"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {playable.map((sport, i) => {
          const xp = xpProgressInLevel(sport.total_xp, sport.level);
          return (
            <HolographicCard key={sport.id} delay={i * 0.04}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-cyan-100">{sport.name}</p>
                <RankBadge rank={sport.rank} size="sm" />
              </div>
              <p className="text-[10px] text-cyan-500/40 mt-1">
                Lv.{sport.level} · {sport.sessions_count} sessions
              </p>
              <div className="mt-2">
                <XpBar
                  label=""
                  current={xp.current}
                  required={xp.required}
                  percent={xp.percent}
                  showValues={false}
                  size="sm"
                />
              </div>
              <Button
                size="sm"
                className={cn("w-full mt-3", sport.played_today && "opacity-50")}
                disabled={sport.played_today || loadingId === sport.id}
                onClick={() => logSession(sport.id)}
              >
                {sport.played_today ? "Logged today" : "Log session"}
              </Button>
            </HolographicCard>
          );
        })}
      </div>
    </div>
  );
}
