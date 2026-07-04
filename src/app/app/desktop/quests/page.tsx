"use client";

import { QuestPanel } from "@/components/features/QuestPanel";
import { QuestKanban } from "@/components/features/QuestKanban";
import { useGameStore } from "@/stores/game-store";

export default function DesktopQuestsPage() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Quest Board
        </h1>
        <p className="text-cyan-500/50 mt-1">
          Kanban view — daily, weekly, dungeon, and completed
        </p>
      </header>

      <QuestKanban quests={stats.quests} />

      <section>
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
          All Active
        </h2>
        <QuestPanel quests={stats.quests.filter((q) => q.status === "active")} />
      </section>
    </div>
  );
}
