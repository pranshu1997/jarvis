"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Moon, Footprints, Weight } from "lucide-react";
import { useToastStore } from "@/stores/toast-store";

interface HealthSyncCardProps {
  onSynced?: () => void;
}

interface HealthFormState {
  steps: string;
  sleep_hours: string;
  hrv: string;
  weight_kg: string;
  date: string;
}

const EMPTY_FORM: HealthFormState = {
  steps: "",
  sleep_hours: "",
  hrv: "",
  weight_kg: "",
  date: new Date().toISOString().slice(0, 10),
};

export function HealthSyncCard({ onSynced }: HealthSyncCardProps) {
  const [form, setForm] = useState<HealthFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const updateField = (field: keyof HealthFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const payload: Record<string, number | string> = { date: form.date };
    if (form.steps) payload.steps = parseFloat(form.steps);
    if (form.sleep_hours) payload.sleep_hours = parseFloat(form.sleep_hours);
    if (form.hrv) payload.hrv = parseFloat(form.hrv);
    if (form.weight_kg) payload.weight_kg = parseFloat(form.weight_kg);

    if (Object.keys(payload).length <= 1) {
      useToastStore.getState().show("Enter at least one health metric", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/health/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as {
        success?: boolean;
        habitsAutoCompleted?: string[];
        error?: string;
      };

      if (!res.ok) {
        useToastStore.getState().show(data.error ?? "Sync failed", "error");
        return;
      }

      const autoCount = data.habitsAutoCompleted?.length ?? 0;
      const msg =
        autoCount > 0
          ? `Health synced · ${autoCount} habit${autoCount > 1 ? "s" : ""} auto-completed`
          : "Health data synced";
      useToastStore.getState().show(msg, "success");
      setLastSync(new Date().toLocaleTimeString());
      setForm(EMPTY_FORM);
      onSynced?.();
    } catch {
      useToastStore.getState().show("Sync failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card glow>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Health Sync
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-cyan-500/60 flex items-center gap-1.5">
                <Footprints className="w-3 h-3" />
                Steps
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                step="100"
                placeholder="e.g. 8500"
                value={form.steps}
                onChange={(e) => updateField("steps", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-cyan-500/60 flex items-center gap-1.5">
                <Moon className="w-3 h-3" />
                Sleep (hours)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.25"
                placeholder="e.g. 7.5"
                value={form.sleep_hours}
                onChange={(e) => updateField("sleep_hours", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-cyan-500/60 flex items-center gap-1.5">
                <Heart className="w-3 h-3" />
                HRV (ms)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                step="1"
                placeholder="e.g. 55"
                value={form.hrv}
                onChange={(e) => updateField("hrv", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-cyan-500/60 flex items-center gap-1.5">
                <Weight className="w-3 h-3" />
                Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                max="500"
                step="0.1"
                placeholder="e.g. 78.5"
                value={form.weight_kg}
                onChange={(e) => updateField("weight_kg", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-cyan-500/60">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              variant="hologram"
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? "Syncing…" : "Sync Health Data"}
            </Button>
          </div>

          {lastSync && (
            <p className="text-xs text-cyan-500/40 text-center">
              Last synced at {lastSync} · Steps ≥ 8k or sleep ≥ 7h auto-completes awareness habits
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
