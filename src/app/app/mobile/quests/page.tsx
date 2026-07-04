"use client";

import { QuestPanel } from "@/components/features/QuestPanel";
import { PinQuestMobile } from "@/components/features/PinQuestMobile";
import { QuestKanban } from "@/components/features/QuestKanban";
import { useGameStore } from "@/stores/game-store";

export default function MobileQuestsPage() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  return (
    <div className="space-y-6 pt-4">
      <h2 className="font-display text-xl font-bold text-cyan-100">
        Active Quests
      </h2>
      <PinQuestMobile quests={stats.quests} />
      <QuestKanban quests={stats.quests} />
      <QuestPanel quests={stats.quests} />
    </div>
  );
}
