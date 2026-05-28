"use client";

import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import { RotateCcw } from "lucide-react";
import type { WorkoutSession } from "@/types/database";

const BRANCHES = [
  { slug: "strength", label: "Strength" },
  { slug: "sports_branch", label: "Sports" },
  { slug: "endurance", label: "Endurance" },
  { slug: "mobility", label: "Mobility" },
  { slug: "fighting", label: "Fighting" },
] as const;

export function WorkoutSessionBar({
  activeSession,
  onChange,
}: {
  activeSession: WorkoutSession | null;
  onChange: () => void;
}) {
  const start = async (branchSlug: string) => {
    const res = await fetch("/api/workouts/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchSlug }),
    });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show(`Session started — ${branchSlug}`, "success");
    onChange();
  };

  const end = async () => {
    const res = await fetch("/api/workouts/session/end", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show(
      `Session complete · ${data.exerciseCount} exercises · +${data.totalXp} XP`,
      "celebration"
    );
    onChange();
  };

  if (activeSession) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10">
        <div>
          <p className="text-sm font-medium text-cyan-100">Active session</p>
          <p className="text-xs text-cyan-500/50 capitalize">
            {activeSession.branch_slug ?? activeSession.session_type} ·{" "}
            {activeSession.exercise_count} exercises · +{activeSession.total_xp} XP
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={end}>
          End session
        </Button>
      </div>
    );
  }

  const repeatLast = async () => {
    const res = await jarvisFetch("/api/workouts/last-session");
    const data = await res.json();
    if (!res.ok || !data.branchSlug) {
      useToastStore.getState().show("No previous session to repeat", "info");
      return;
    }
    await start(data.branchSlug);
    if (data.exerciseNames?.length) {
      useToastStore.getState().show(
        `Repeat: ${(data.exerciseNames as string[]).join(", ")}`,
        "info"
      );
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-cyan-500/50 w-full mb-1">Start session</span>
      {BRANCHES.map((b) => (
        <Button key={b.slug} variant="outline" size="sm" onClick={() => start(b.slug)}>
          {b.label}
        </Button>
      ))}
      <Button variant="hologram" size="sm" onClick={() => void repeatLast()}>
        <RotateCcw className="w-4 h-4" />
        Repeat last
      </Button>
    </div>
  );
}
