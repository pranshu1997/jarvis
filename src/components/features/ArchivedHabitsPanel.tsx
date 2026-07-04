"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";

export function ArchivedHabitsPanel() {
  const { refetch } = useDashboard();
  const [habits, setHabits] = useState<{ id: string; name: string }[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const res = await jarvisFetch("/api/habits/archived");
    const data = await res.json();
    setHabits(data.habits ?? []);
    setLoaded(true);
  };

  const restore = async (habitId: string) => {
    await jarvisFetch("/api/habits/update", {
      method: "POST",
      body: JSON.stringify({ habitId, is_active: true }),
    });
    await load();
    refetch();
  };

  if (!loaded) return <Button variant="outline" size="sm" onClick={load}>Show archived habits</Button>;
  if (habits.length === 0) return <p className="text-xs text-cyan-500/40">No archived habits</p>;

  return (
    <div className="space-y-2">
      {habits.map((h) => (
        <div key={h.id} className="flex items-center justify-between rounded-lg border border-cyan-500/10 px-3 py-2">
          <span className="text-sm text-cyan-300/70">{h.name}</span>
          <Button size="sm" variant="ghost" onClick={() => restore(h.id)}>Restore</Button>
        </div>
      ))}
    </div>
  );
}
