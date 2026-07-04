"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function CoachSuggestHabits() {
  const [suggestions, setSuggestions] = useState<{ title: string; category: string; reason: string }[]>([]);

  const load = async () => {
    const res = await jarvisFetch("/api/coach/suggest-habits");
    const d = await res.json();
    setSuggestions(d.suggestions ?? []);
  };

  const add = async (title: string, category: string) => {
    await jarvisFetch("/api/habits/create", {
      method: "POST",
      body: JSON.stringify({ name: title, categorySlug: category }),
    });
  };

  if (suggestions.length === 0) {
    return <Button variant="outline" size="sm" onClick={load}>Get coach suggestions</Button>;
  }

  return (
    <div className="space-y-2">
      {suggestions.map((s) => (
        <div key={s.title} className="flex items-center justify-between rounded-lg border border-cyan-500/15 px-3 py-2">
          <div>
            <p className="text-sm text-cyan-100">{s.title}</p>
            <p className="text-[10px] text-cyan-500/50">{s.reason}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => void add(s.title, s.category)}>Add</Button>
        </div>
      ))}
    </div>
  );
}
