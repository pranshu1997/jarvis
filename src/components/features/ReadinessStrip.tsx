"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import type { ReadinessEntry } from "@/lib/player-settings-extended";

export function ReadinessStrip({
  initial,
  onLogged,
}: {
  initial: ReadinessEntry | null;
  onLogged: () => void;
}) {
  const [entry, setEntry] = useState(initial);
  const [sleep, setSleep] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(3);

  const submit = async () => {
    const res = await jarvisFetch("/api/readiness", {
      method: "POST",
      body: JSON.stringify({ sleep, energy, soreness }),
    });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    setEntry(data.entry);
    useToastStore.getState().show("Readiness logged", "success");
    onLogged();
  };

  const rec = entry?.recommendation ?? "maintain";
  const recLabel =
    rec === "push" ? "Push day" : rec === "recover" ? "Recover" : "Maintain";

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/50">
          Readiness
        </p>
        {entry && (
          <span className="font-mono text-cyan-300 text-sm">
            {entry.score}/100 · {recLabel}
          </span>
        )}
      </div>
      {!entry && (
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-cyan-500/50">
          <div>
            <p>Sleep</p>
            <input type="range" min={1} max={5} value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="w-full accent-cyan-400" />
            <p className="text-cyan-300">{sleep}</p>
          </div>
          <div>
            <p>Energy</p>
            <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full accent-cyan-400" />
            <p className="text-cyan-300">{energy}</p>
          </div>
          <div>
            <p>Soreness</p>
            <input type="range" min={1} max={5} value={soreness} onChange={(e) => setSoreness(Number(e.target.value))} className="w-full accent-cyan-400" />
            <p className="text-cyan-300">{soreness}</p>
          </div>
        </div>
      )}
      {!entry && (
        <Button variant="hologram" size="sm" className="w-full" onClick={() => void submit()}>
          Log morning check-in
        </Button>
      )}
    </div>
  );
}
