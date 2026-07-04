"use client";

import { useEffect, useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";

export function LastWorkoutResume() {
  const { refetch } = useDashboard();
  const [session, setSession] = useState<{ id: string; started_at: string } | null>(null);

  useEffect(() => {
    jarvisFetch("/api/workouts/last-session")
      .then((r) => r.json())
      .then((d) => setSession(d.session ?? null))
      .catch(() => {});
  }, []);

  const resume = async () => {
    if (!session) return;
    await jarvisFetch("/api/workouts/session/start", { method: "POST", body: JSON.stringify({ resumeId: session.id }) });
    refetch();
  };

  if (!session) return null;

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-cyan-500/50">Last session</p>
        <p className="text-sm text-cyan-100">{new Date(session.started_at).toLocaleDateString()}</p>
      </div>
      <Button size="sm" variant="outline" onClick={resume}>Resume</Button>
    </div>
  );
}
