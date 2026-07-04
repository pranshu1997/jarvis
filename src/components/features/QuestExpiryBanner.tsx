"use client";

import { useGameStore } from "@/stores/game-store";
import { Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function QuestExpiryBanner() {
  const meta = useGameStore((s) => s.stats?.meta as {
    expiringQuests?: { quest: { id: string; title: string }; hoursLeft: number }[];
    urgentQuestCount?: number;
  } | undefined);

  const expiring = meta?.expiringQuests ?? [];
  if (expiring.length === 0) return null;

  const urgent = expiring[0]!;

  return (
    <div className="mx-4 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 flex items-center gap-3">
      {meta?.urgentQuestCount ? (
        <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-orange-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-orange-200 truncate">
          <span className="font-semibold">{urgent.quest.title}</span> expires in {urgent.hoursLeft}h
        </p>
        {expiring.length > 1 && (
          <p className="text-[10px] text-orange-400/60">+{expiring.length - 1} more expiring soon</p>
        )}
      </div>
      <Link href="/app/mobile/quests" className="text-[10px] text-orange-400 shrink-0">View</Link>
    </div>
  );
}
