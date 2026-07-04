"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";

export function MonarchSkillTree() {
  const { refetch } = useDashboard();
  const coins = useGameStore((s) => (s.stats?.meta as { shadowCoins?: number })?.shadowCoins ?? 0);
  const [skills, setSkills] = useState<{ id: string; title: string; description: string; cost: number; max_level: number }[]>([]);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await jarvisFetch("/api/skill-tree");
    const data = await res.json();
    setSkills(data.skills ?? []);
    setLevels(data.levels ?? {});
    setLoaded(true);
  };

  const purchase = async (skillId: string) => {
    const res = await jarvisFetch("/api/skill-tree", {
      method: "POST",
      body: JSON.stringify({ skillId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Failed");
      return;
    }
    setMsg("Skill upgraded!");
    await load();
    refetch();
  };

  if (!loaded) {
    return (
      <Button variant="outline" size="sm" onClick={load} className="w-full">
        Load Skill Tree
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-cyan-500/50">{coins} shadow coins available</p>
      {skills.map((skill) => {
        const lvl = levels[skill.id] ?? 0;
        const cost = skill.cost * (lvl + 1);
        const maxed = lvl >= skill.max_level;
        return (
          <div key={skill.id} className="rounded-xl border border-cyan-500/15 p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-cyan-100">{skill.title}</p>
                <p className="text-xs text-cyan-500/50">{skill.description}</p>
                <p className="text-[10px] text-cyan-400/40 mt-1">Level {lvl}/{skill.max_level}</p>
              </div>
              {!maxed && (
                <Button size="sm" variant="ghost" onClick={() => purchase(skill.id)} className="text-amber-400 text-xs">
                  {cost} 🪙
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {msg && <p className="text-xs text-cyan-400">{msg}</p>}
    </div>
  );
}
