"use client";

import { SPORT_DRILLS } from "@/lib/sport-drills";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useToastStore } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";

export function SportDrillPicker() {
  const { refetch } = useDashboard();

  const log = async (drillId: string) => {
    const res = await jarvisFetch("/api/sports/drill", {
      method: "POST",
      body: JSON.stringify({ drillId }),
    });
    const d = await res.json();
    if (res.ok) {
      useToastStore.getState().show(`+${d.xpEarned} XP`, "success");
      refetch();
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-cyan-500/50">Sport drills</p>
      {SPORT_DRILLS.slice(0, 4).map((d) => (
        <div key={d.id} className="flex items-center justify-between rounded-lg border border-cyan-500/10 px-3 py-2">
          <div>
            <p className="text-sm text-cyan-100">{d.title}</p>
            <p className="text-[10px] text-cyan-500/40">{d.duration_min}min · +{d.xp_reward} XP</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => void log(d.id)}>Log</Button>
        </div>
      ))}
    </div>
  );
}
