"use client";

import { useGameStore } from "@/stores/game-store";

export function CoachQuickPrompts({ onSelect }: { onSelect: (q: string) => void }) {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const meta = stats.meta as {
    atRiskList?: { habit: { name: string } }[];
    deloadSuggested?: boolean;
    perfectWeek?: { needed: number };
    weeklyFocusCategory?: string;
  };

  const prompts: string[] = [];
  if (meta.atRiskList?.[0]) {
    prompts.push(`How do I protect my ${meta.atRiskList[0].habit.name} streak tonight?`);
  }
  if (meta.deloadSuggested) {
    prompts.push("Should I take a deload week based on my readiness?");
  }
  if (meta.perfectWeek && meta.perfectWeek.needed > 0) {
    prompts.push(`What's the fastest path to ${meta.perfectWeek.needed} more perfect days this week?`);
  }
  if (meta.weeklyFocusCategory) {
    prompts.push(`How can I dominate my ${meta.weeklyFocusCategory} pillar this week?`);
  }
  prompts.push("What's my single highest-leverage habit today?");

  const unique = [...new Set(prompts)].slice(0, 4);

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {unique.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className="text-[10px] px-3 py-1.5 rounded-full border border-cyan-500/20 text-cyan-400/80 hover:bg-cyan-500/10 text-left"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
