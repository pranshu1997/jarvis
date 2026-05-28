"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoachPage() {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">JARVIS Coach</h1>
        <p className="text-cyan-500/50 mt-1">AI advisor — coming soon</p>
      </header>
      <Card glow>
        <CardHeader>
          <CardTitle>Claude-powered insights</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-cyan-100/70 space-y-2">
          <p>
            This module will analyze your XP events, streaks, PRs, and readiness to answer
            questions like &quot;Why is Physical stalling?&quot; and generate weekly dungeon
            quests.
          </p>
          <p className="text-cyan-500/40">
            Requires <code className="text-cyan-400">ANTHROPIC_API_KEY</code> in environment.
            Local-first: data stays on your machine; only prompts sent on demand.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
