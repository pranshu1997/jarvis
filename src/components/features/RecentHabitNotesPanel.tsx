"use client";

import { useGameStore } from "@/stores/game-store";

export function RecentHabitNotesPanel() {
  const notes = useGameStore(
    (s) => (s.stats?.meta as { recentHabitNotes?: { habitName: string; note: string; date: string }[] })?.recentHabitNotes
  ) ?? [];
  if (notes.length === 0) return null;

  return (
    <div className="rounded-xl border border-cyan-500/15 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-cyan-500/50">Recent notes</p>
      {notes.map((n, i) => (
        <div key={i} className="text-xs">
          <span className="text-cyan-400/70">{n.habitName}</span>
          <span className="text-cyan-500/30 mx-1">·</span>
          <span className="text-cyan-200/60 italic">{n.note}</span>
        </div>
      ))}
    </div>
  );
}
