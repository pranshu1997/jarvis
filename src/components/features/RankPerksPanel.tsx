"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";

interface Perk {
  id: string;
  rank: string;
  title: string;
  description: string;
}

export function RankPerksPanel() {
  const { refetch } = useDashboard();
  const [eligible, setEligible] = useState<Perk[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const res = await jarvisFetch("/api/rank-perks");
    const data = await res.json();
    setEligible(data.eligible ?? []);
    setLoaded(true);
  };

  const claim = async (perkId: string) => {
    await jarvisFetch("/api/rank-perks", { method: "POST", body: JSON.stringify({ perkId }) });
    await load();
    refetch();
  };

  if (!loaded) {
    return <Button variant="outline" size="sm" onClick={load}>View Rank Perks</Button>;
  }

  if (eligible.length === 0) {
    return <p className="text-xs text-cyan-500/40">All eligible perks claimed</p>;
  }

  return (
    <div className="space-y-2">
      {eligible.map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-lg border border-cyan-500/15 px-3 py-2">
          <div>
            <p className="text-sm text-cyan-100">{p.title} <span className="text-cyan-500/40">({p.rank})</span></p>
            <p className="text-xs text-cyan-500/50">{p.description}</p>
          </div>
          <Button size="sm" onClick={() => claim(p.id)}>Claim</Button>
        </div>
      ))}
    </div>
  );
}
