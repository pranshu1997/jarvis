"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";

const TITLES = [
  "Shadow Hunter",
  "Gate Breaker",
  "Monarch Candidate",
  "Dungeon Raider",
  "Streak Keeper",
  "Iron Discipline",
  "Awakened One",
];

export function ProfileTitlePicker() {
  const { refetch } = useDashboard();
  const current = useGameStore((s) => (s.stats?.meta as { profileTitle?: string })?.profileTitle) ?? "";
  const [title, setTitle] = useState(current);

  const save = async (t: string) => {
    setTitle(t);
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ profile_title: t }),
    });
    refetch();
  };

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-cyan-500/50">Hunter title</p>
      <div className="flex flex-wrap gap-2">
        {TITLES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => void save(t)}
            className={`text-[10px] px-3 py-1 rounded-full border transition-colors ${
              title === t
                ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                : "border-cyan-500/20 text-cyan-400/60 hover:border-cyan-400/40"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
