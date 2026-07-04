"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";

const TABS = [
  { id: "game", label: "Game" },
  { id: "body", label: "Body" },
  { id: "system", label: "System" },
] as const;

interface Section {
  tab: typeof TABS[number]["id"];
  title: string;
  children: ReactNode;
}

export function SettingsTabs({ sections }: { sections: Section[] }) {
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("game");
  const [query, setQuery] = useState("");

  const filtered = sections.filter((s) => {
    if (s.tab !== tab) return false;
    if (!query.trim()) return true;
    return s.title.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings..."
          className="w-full pl-10 pr-4 py-2 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-sm text-cyan-100"
        />
      </div>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs rounded-lg border ${
              tab === t.id ? "border-cyan-400 bg-cyan-500/10 text-cyan-200" : "border-cyan-500/15 text-cyan-500/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {filtered.map((s) => (
          <section key={s.title}>
            <h3 className="text-xs uppercase tracking-widest text-cyan-500/50 mb-3">{s.title}</h3>
            {s.children}
          </section>
        ))}
      </div>
    </div>
  );
}
