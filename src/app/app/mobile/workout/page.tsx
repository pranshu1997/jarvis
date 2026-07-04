"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { WorkoutSessionBar } from "@/components/workout/WorkoutSessionBar";
import { LastWorkoutResume } from "@/components/workout/LastWorkoutResume";
import { WorkoutReadinessBanner } from "@/components/features/WorkoutReadinessBanner";
import { PRPredictionCard } from "@/components/features/PRPredictionCard";
import { SportsPanel } from "@/components/workout/SportsPanel";
import { SkillTreeView } from "@/components/workout/SkillTreeView";
import { getActiveSession } from "@/lib/workout-progression";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import { SportDrillPicker } from "@/components/features/SportDrillPicker";
import { HydrationQuickLog } from "@/components/features/HydrationQuickLog";
import { MacroQuickLog } from "@/components/features/MacroQuickLog";

export default function MobileWorkoutPage() {
  const { stats, refetch, isLoading } = useDashboard();
  const [view, setView] = useState<"lift" | "sports" | "skills">("lift");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading || !stats) return null;

  const activeSession = getActiveSession(stats);

  const logQuick = async () => {
    if (!selectedId) return;
    const res = await fetch("/api/workouts/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: selectedId }),
    });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show(`+${data.xpEarned} XP`, "success");
    setSelectedId(null);
    refetch();
  };

  return (
    <div className="space-y-4 pt-4 pb-24">
      <h2 className="font-display text-xl font-bold text-cyan-100">Workout</h2>

      <LastWorkoutResume />
      <WorkoutReadinessBanner />
      <PRPredictionCard />
      <WorkoutSessionBar activeSession={activeSession} onChange={refetch} />
      <MacroQuickLog />
      <HydrationQuickLog />

      <div className="flex gap-2">
        {(["lift", "sports", "skills"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs border capitalize",
              view === v
                ? "border-cyan-400 bg-cyan-500/20"
                : "border-slate-700 text-cyan-100/50"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "lift" && (
        <div className="space-y-2">
          {stats.exercises.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setSelectedId(ex.id)}
              className={cn(
                "w-full text-left p-3 rounded-xl border",
                selectedId === ex.id
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-slate-700"
              )}
            >
              <p className="text-sm text-cyan-100">{ex.name}</p>
              <p className="text-[10px] text-cyan-500/40">
                Lv.{ex.level}
                {ex.personal_record != null &&
                  ` · PR ${ex.personal_record}${ex.pr_unit}`}
              </p>
            </button>
          ))}
          {selectedId && (
            <Button className="w-full" onClick={logQuick}>
              Quick log (no weight)
            </Button>
          )}
        </div>
      )}

      {view === "sports" && (
        <div className="space-y-4">
          <SportDrillPicker />
          <SportsPanel sports={stats.sports} onLogged={refetch} />
        </div>
      )}

      {view === "skills" && <SkillTreeView skills={stats.skills} />}
    </div>
  );
}
