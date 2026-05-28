"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";

export function BodyMeasurementsCard({ onLogged }: { onLogged: () => void }) {
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [arms, setArms] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  const submit = async () => {
    const res = await jarvisFetch("/api/measurements", {
      method: "POST",
      body: JSON.stringify({
        waist: waist ? Number(waist) : undefined,
        chest: chest ? Number(chest) : undefined,
        arms: arms ? Number(arms) : undefined,
        bodyFatPct: bodyFat ? Number(bodyFat) : undefined,
      }),
    });
    if (!res.ok) {
      useToastStore.getState().show("Failed", "error");
      return;
    }
    useToastStore.getState().show("Measurements logged", "success");
    onLogged();
  };

  return (
    <Card glow>
      <CardHeader>
        <CardTitle className="text-base">Body measurements</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <input placeholder="Waist cm" value={waist} onChange={(e) => setWaist(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm" />
        <input placeholder="Chest cm" value={chest} onChange={(e) => setChest(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm" />
        <input placeholder="Arms cm" value={arms} onChange={(e) => setArms(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm" />
        <input placeholder="Body fat %" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm" />
        <Button variant="hologram" className="col-span-2" onClick={() => void submit()}>
          Log weekly
        </Button>
      </CardContent>
    </Card>
  );
}
