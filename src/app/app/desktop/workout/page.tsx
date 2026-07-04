"use client";

import { useState } from "react";
import { HolographicCard } from "@/components/shared/HolographicCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XpBar } from "@/components/effects/XpBar";
import { xpProgressInLevel } from "@/lib/xp-engine";
import { useDashboard } from "@/hooks/useDashboard";
import { useToastStore } from "@/stores/toast-store";
import { SkillTreeView } from "@/components/workout/SkillTreeView";
import { SportsPanel } from "@/components/workout/SportsPanel";
import { WorkoutSessionBar } from "@/components/workout/WorkoutSessionBar";
import { getActiveSession } from "@/lib/workout-progression";
import { suggestNextSession } from "@/lib/progressive-overload";
import { ExerciseProgressChart } from "@/components/workout/ExerciseProgressChart";
import { RestTimer } from "@/components/workout/RestTimer";
import { WorkoutTemplates } from "@/components/workout/WorkoutTemplates";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";
import { SportDrillPicker } from "@/components/features/SportDrillPicker";
import { SupersetQuickLog } from "@/components/features/SupersetQuickLog";
import { MacroQuickLog } from "@/components/features/MacroQuickLog";

const TABS = [
  { id: "lift", label: "Strength" },
  { id: "sports", label: "Sports" },
  { id: "skills", label: "Skill Tree" },
  { id: "sessions", label: "Sessions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DesktopWorkoutPage() {
  const { stats, refetch, isLoading } = useDashboard();
  const [tab, setTab] = useState<TabId>("lift");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");

  if (isLoading || !stats) return null;

  const exercises = stats.exercises;
  const logs = stats.workoutLogs;
  const skills = stats.skills;
  const sports = stats.sports;
  const sessions = stats.workoutSessions;
  const selected = exercises.find((e) => e.id === selectedId);
  const activeSession = getActiveSession(stats);

  const logWorkout = async () => {
    if (!selectedId) return;
    const res = await fetch("/api/workouts/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: selectedId,
        weight: weight ? Number(weight) : undefined,
        reps: reps ? Number(reps) : undefined,
        sets: sets ? Number(sets) : undefined,
        rpe: rpe ? Number(rpe) : undefined,
        notes: notes || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    if (data.isPr) {
      const ex = exercises.find((e) => e.id === selectedId);
      useGameStore.getState().triggerPr(ex?.name ?? "Exercise", weight ? Number(weight) : null);
    }
    useToastStore.getState().show(
      data.isPr ? `PR! +${data.xpEarned} XP` : `+${data.xpEarned} XP logged`,
      data.isPr ? "celebration" : "success"
    );
    setWeight("");
    setReps("");
    setSets("");
    refetch();
  };

  const byMuscle = exercises.reduce(
    (acc, ex) => {
      const g = ex.muscle_group ?? "other";
      if (!acc[g]) acc[g] = [];
      acc[g].push(ex);
      return acc;
    },
    {} as Record<string, typeof exercises>
  );

  const strengthSkill = skills.find((s) => s.slug === "strength");
  const workoutRoot = skills.find((s) => s.slug === "workout");

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Workout System
        </h1>
        <p className="text-cyan-500/50 mt-1">
          Exercises, PRs, sports levels, skill tree, and sessions — all from your profile
        </p>
        {(workoutRoot || strengthSkill) && (
          <div className="flex gap-6 mt-4 text-sm font-mono text-cyan-300/80">
            {workoutRoot && (
              <span>
                Workout Lv.{workoutRoot.level} · {workoutRoot.rank}
              </span>
            )}
            {strengthSkill && (
              <span>
                Strength Lv.{strengthSkill.level} · {strengthSkill.rank}
              </span>
            )}
          </div>
        )}
        <div className="mt-4">
          <p className="text-xs text-cyan-500/50 mb-2">Quick macros</p>
          <MacroQuickLog />
        </div>
      </header>

      <WorkoutSessionBar activeSession={activeSession} onChange={refetch} />
      <div className="grid grid-cols-2 gap-4">
        <RestTimer />
        <WorkoutTemplates
          exercises={exercises}
          onSelectExercise={setSelectedId}
          onStartSession={refetch}
        />
      </div>

      <div className="flex gap-2 border-b border-cyan-500/20 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40"
                : "text-cyan-100/50 hover:text-cyan-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lift" && (
        <>
          <SupersetQuickLog exerciseIds={exercises.slice(0, 3).map((e) => e.id)} />
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(byMuscle).map(([muscle, exs], i) => (
              <HolographicCard key={muscle} delay={i * 0.05}>
                <h3 className="font-display font-semibold text-cyan-300 capitalize mb-3">
                  {muscle.replace(/_/g, " ")}
                </h3>
                <div className="space-y-2">
                  {exs.map((ex) => {
                    const xp = xpProgressInLevel(ex.total_xp, ex.level);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => setSelectedId(ex.id)}
                        className={cn(
                          "w-full text-left p-2 rounded-lg border transition-all",
                          selectedId === ex.id
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "border-slate-700 hover:border-cyan-500/30"
                        )}
                      >
                        <p className="text-sm font-medium text-cyan-100">{ex.name}</p>
                        <p className="text-[10px] text-cyan-500/40">
                          Lv.{ex.level}
                          {ex.personal_record != null &&
                            ` · PR ${ex.personal_record}${ex.pr_unit}`}
                        </p>
                        <XpBar
                          label=""
                          current={xp.current}
                          required={xp.required}
                          percent={xp.percent}
                          showValues={false}
                          size="sm"
                        />
                      </button>
                    );
                  })}
                </div>
              </HolographicCard>
            ))}
          </div>

          {selected && (
            <Card glow>
              <CardHeader>
                <CardTitle>Log — {selected.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                <p className="text-xs text-cyan-500/50 mb-2">Weight progression</p>
                <ExerciseProgressChart
                  logs={logs}
                  exerciseId={selectedId}
                />
              </CardContent>
              <CardContent className="flex flex-wrap gap-4 items-end">
                {stats && (
                  <p className="w-full text-xs text-cyan-400/80 font-mono mb-2">
                    Target: {suggestNextSession(stats, selected).note} —{" "}
                    {suggestNextSession(stats, selected).weight ?? "—"}kg ×{" "}
                    {suggestNextSession(stats, selected).reps} ×{" "}
                    {suggestNextSession(stats, selected).sets}
                  </p>
                )}
                <div>
                  <label className="text-xs text-cyan-500/50">
                    Weight ({selected.pr_unit === "reps" ? "optional" : "kg"})
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="block mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 w-24"
                  />
                </div>
                <div>
                  <label className="text-xs text-cyan-500/50">Reps</label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="block mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 w-20"
                  />
                </div>
                <div>
                  <label className="text-xs text-cyan-500/50">Sets</label>
                  <input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="block mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 w-20"
                  />
                </div>
                <div>
                  <label className="text-xs text-cyan-500/50">RPE (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rpe}
                    onChange={(e) => setRpe(e.target.value)}
                    className="block mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 w-20"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs text-cyan-500/50">Notes</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Felt strong…"
                    className="block mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
                  />
                </div>
                <Button onClick={logWorkout}>Log + XP</Button>
              </CardContent>
            </Card>
          )}

          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {logs.slice(0, 10).map((log) => (
                  <p key={log.id} className="text-sm text-cyan-100/70 font-mono">
                    {log.exercise_name}
                    {log.skill_slug ? ` · ${log.skill_slug}` : ""} —{" "}
                    {log.weight ?? "—"}
                    {log.reps != null ? ` × ${log.reps}` : ""} · +{log.xp_earned} XP
                    {log.is_pr ? " PR!" : ""}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tab === "sports" && (
        <div className="space-y-6">
          <SportDrillPicker />
          <SportsPanel sports={sports} onLogged={refetch} />
        </div>
      )}

      {tab === "skills" && <SkillTreeView skills={skills} />}

      {tab === "sessions" && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-cyan-500/50">No sessions yet. Start one above.</p>
          ) : (
            sessions.slice(0, 20).map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-3 rounded-lg border border-slate-700"
              >
                <div>
                  <p className="text-sm text-cyan-100 capitalize">
                    {s.branch_slug ?? s.session_type}
                    {s.is_active && (
                      <span className="ml-2 text-cyan-400 text-xs">ACTIVE</span>
                    )}
                  </p>
                  <p className="text-[10px] text-cyan-500/40 font-mono">
                    {new Date(s.started_at).toLocaleString()}
                    {s.ended_at && ` → ${new Date(s.ended_at).toLocaleTimeString()}`}
                  </p>
                </div>
                <p className="text-sm font-mono text-cyan-300">
                  {s.exercise_count} ex · +{s.total_xp} XP
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
