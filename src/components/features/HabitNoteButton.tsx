"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { MessageSquare } from "lucide-react";

export function HabitNoteButton({ habitId, habitName }: { habitId: string; habitName: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const save = async () => {
    if (!note.trim()) return;
    await jarvisFetch("/api/habits/note", {
      method: "POST",
      body: JSON.stringify({ habitId, note: note.trim() }),
    });
    setNote("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="text-cyan-500/30 hover:text-cyan-400 p-0.5"
        title="Add note"
      >
        <MessageSquare className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="flex gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`Note on ${habitName}…`}
        className="flex-1 text-[10px] bg-slate-900 border border-cyan-500/20 rounded px-2 py-0.5 text-cyan-100"
        onKeyDown={(e) => { if (e.key === "Enter") void save(); if (e.key === "Escape") setOpen(false); }}
      />
      <button type="button" onClick={() => void save()} className="text-[10px] text-cyan-400 px-1">Save</button>
    </div>
  );
}
