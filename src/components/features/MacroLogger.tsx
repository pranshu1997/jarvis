"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";

export function MacroLogger({ onLogged }: { onLogged: () => void }) {
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [calories, setCalories] = useState("");

  const log = async () => {
    const res = await jarvisFetch("/api/macros", {
      method: "POST",
      body: JSON.stringify({
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        calories: Number(calories) || 0,
      }),
    });
    if (!res.ok) {
      useToastStore.getState().show("Failed to log meal", "error");
      return;
    }
    useToastStore.getState().show("Meal logged", "success");
    setProtein("");
    setCarbs("");
    setFat("");
    setCalories("");
    onLogged();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Macro log</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <input placeholder="Protein g" value={protein} onChange={(e) => setProtein(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm text-cyan-50" />
        <input placeholder="Carbs g" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm text-cyan-50" />
        <input placeholder="Fat g" value={fat} onChange={(e) => setFat(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm text-cyan-50" />
        <input placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/20 text-sm text-cyan-50" />
        <Button variant="hologram" className="col-span-2" onClick={() => void log()}>
          Log meal
        </Button>
      </CardContent>
    </Card>
  );
}
