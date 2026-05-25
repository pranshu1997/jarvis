"use client";

import { QuestPanel } from "@/components/features/QuestPanel";
import { useGameStore } from "@/stores/game-store";

export default function DesktopQuestsPage() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const grouped = {
    daily: stats.quests.filter((q) => q.quest_type === "daily"),
    weekly: stats.quests.filter((q) => q.quest_type === "weekly"),
    main: stats.quests.filter((q) => q.quest_type === "main"),
    dungeon: stats.quests.filter((q) => q.quest_type === "dungeon"),
  };

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Quest Board
        </h1>
        <p className="text-cyan-500/50 mt-1">
          Daily, weekly, main quests, and dungeon challenges
        </p>
      </header>

      {Object.entries(grouped).map(([type, quests]) =>
        quests.length > 0 ? (
          <section key={type}>
            <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4 capitalize">
              {type} Quests
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <QuestPanel quests={quests} />
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}
