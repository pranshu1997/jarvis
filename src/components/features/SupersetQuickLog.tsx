"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useToastStore } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";

export function SupersetQuickLog({ exerciseIds }: { exerciseIds: string[] }) {
  const { refetch } = useDashboard();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("8");

  const log = async () => {
    if (exerciseIds.length < 2) return;
    const res = await jarvisFetch("/api/workouts/superset", {
      method: "POST",
      body: JSON.stringify({
        exerciseIds: exerciseIds.slice(0, 3),
        weight: weight ? Number(weight) : undefined,
        reps: Number(reps) || 8,
        sets: 3,
      }),
    });
    const d = await res.json();
    if (res.ok) {
      useToastStore.getState().show(`Superset +${d.xpEarned} XP`, "success");
      refetch();
    }
  };

  if (exerciseIds.length < 2) return null;

  return (
    <div className="rounded-xl border border-cyan-500/15 p-3 space-y-2">
      <p className="text-xs text-cyan-500/50">Quick superset ({exerciseIds.length} exercises)</p>
      <div className="flex gap-2">
        <input placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-16 bg-cyan-950/30 border border-cyan-500/20 rounded px-2 py-1 text-xs text-cyan-100" />
        <input placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value)} className="w-16 bg-cyan-950/30 border border-cyan-500/20 rounded px-2 py-1 text-xs text-cyan-100" />
        <Button size="sm" onClick={log}>Log</Button>
      </div>
    </div>
  );
}
