"use client";

import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useToastStore } from "@/stores/toast-store";

const PRESETS = [
  { label: "High protein", protein: 40, calories: 0 },
  { label: "Meal log", protein: 25, calories: 500 },
  { label: "Snack", protein: 10, calories: 200 },
];

export function MacroQuickLog() {
  const { refetch } = useDashboard();

  const log = async (protein: number, calories: number) => {
    const res = await jarvisFetch("/api/macros", {
      method: "POST",
      body: JSON.stringify({ protein, calories }),
    });
    if (res.ok) {
      useToastStore.getState().show("Macros logged", "success");
      refetch();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => void log(p.protein, p.calories)}
          className="text-[10px] px-3 py-1.5 rounded-full border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
        >
          +{p.label}
        </button>
      ))}
    </div>
  );
}
