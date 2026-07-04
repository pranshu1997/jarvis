"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import type { Exercise } from "@/types/database";

interface WorkoutTemplate {
  id: string;
  name: string;
  exercise_ids: string[];
  notes?: string;
}

export function WorkoutTemplates({
  exercises,
  onSelectExercise,
  onStartSession,
}: {
  exercises: Exercise[];
  onSelectExercise: (id: string) => void;
  onStartSession?: () => void;
}) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const load = async () => {
    const res = await jarvisFetch("/api/workouts/templates");
    if (res.ok) {
      const data = await res.json();
      setTemplates(data.templates ?? []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!name.trim() || selected.length === 0) return;
    const res = await jarvisFetch("/api/workouts/templates", {
      method: "POST",
      body: JSON.stringify({ name, exerciseIds: selected }),
    });
    if (!res.ok) {
      useToastStore.getState().show("Failed to save template", "error");
      return;
    }
    useToastStore.getState().show("Template saved", "success");
    setName("");
    setSelected([]);
    void load();
  };

  const loadTemplate = (t: WorkoutTemplate) => {
    if (t.exercise_ids[0]) onSelectExercise(t.exercise_ids[0]);
    onStartSession?.();
    useToastStore.getState().show(`Loaded: ${t.name}`, "info");
  };

  const remove = async (id: string) => {
    await jarvisFetch(`/api/workouts/templates?id=${id}`, { method: "DELETE" });
    void load();
  };

  return (
    <Card glow>
      <CardHeader>
        <CardTitle className="text-base">Workout templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-cyan-500/20 p-2"
          >
            <div>
              <p className="text-sm text-cyan-100">{t.name}</p>
              <p className="text-[10px] text-cyan-500/50">
                {t.exercise_ids.length} exercises
              </p>
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => loadTemplate(t)}>
                Load
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => void remove(t.id)}>
                ×
              </Button>
            </div>
          </div>
        ))}
        <input
          placeholder="Template name (e.g. Push A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm text-cyan-50"
        />
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
          {exercises.slice(0, 12).map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() =>
                setSelected((s) =>
                  s.includes(ex.id) ? s.filter((x) => x !== ex.id) : [...s, ex.id]
                )
              }
              className={`text-[10px] px-2 py-1 rounded border ${
                selected.includes(ex.id)
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                  : "border-cyan-500/20 text-cyan-500/60"
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>
        <Button type="button" variant="hologram" size="sm" onClick={() => void save()}>
          Save template
        </Button>
      </CardContent>
    </Card>
  );
}
