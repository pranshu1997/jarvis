"use client";

import { getRoutines } from "@/lib/routines";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";
import type { DashboardStats } from "@/types/database";

export function RoutinePanel({
  stats,
  onComplete,
  onRoutineDone,
}: {
  stats: DashboardStats;
  onComplete: (id: string, done: boolean) => void;
  onRoutineDone: () => void;
}) {
  const routines = getRoutines(stats);

  const runChain = async (routineId: string, habitIds: string[]) => {
    for (const id of habitIds) {
      const h = stats.habits.find((x) => x.id === id);
      if (h && !h.completed_today) await onComplete(id, true);
    }
    const res = await jarvisFetch("/api/routines/complete", {
      method: "POST",
      body: JSON.stringify({ routineId }),
    });
    const data = await res.json();
    if (res.ok && data.bonusXp) {
      useToastStore.getState().show(`Routine complete +${data.bonusXp} XP`, "celebration");
    }
    onRoutineDone();
  };

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/50">Routines</p>
      {routines.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between gap-2 p-3 rounded-lg border border-cyan-500/20 bg-slate-900/40"
        >
          <div>
            <p className="text-sm text-cyan-100">{r.name}</p>
            <p className="text-[10px] text-cyan-500/40">
              {r.habit_ids.length} habits · +{r.bonus_xp} bonus XP
            </p>
          </div>
          <Button
            size="sm"
            variant="hologram"
            onClick={() => void runChain(r.id, r.habit_ids)}
          >
            Run chain
          </Button>
        </div>
      ))}
    </div>
  );
}
