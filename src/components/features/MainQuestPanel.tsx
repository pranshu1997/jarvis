"use client";

import { Scroll } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import {
  getCurrentMainQuestChapter,
  getMainQuestChapter,
  getChapterProgress,
  MAIN_QUEST_MAX_CHAPTER,
} from "@/lib/main-quest";

export function MainQuestPanel() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const chapterNum = getCurrentMainQuestChapter(stats);
  if (chapterNum > MAIN_QUEST_MAX_CHAPTER) {
    return (
      <div className="glass rounded-xl p-4 border border-purple-500/30 bg-purple-500/5">
        <p className="font-display font-bold text-cyan-100">Main Quest Complete</p>
        <p className="text-xs text-cyan-500/50 mt-1">All chapters cleared. Monarch path unlocked.</p>
      </div>
    );
  }

  const chapter = getMainQuestChapter(chapterNum);
  if (!chapter) return null;

  const progress = getChapterProgress(stats, chapter);

  return (
    <div className="glass rounded-xl p-4 border border-purple-500/30 bg-purple-500/5">
      <div className="flex items-center gap-2 mb-2">
        <Scroll className="w-4 h-4 text-purple-400" />
        <p className="text-[10px] uppercase tracking-widest text-purple-400/60">
          Main Quest · {chapter.tagline}
        </p>
      </div>
      <p className="font-display font-bold text-cyan-100">{chapter.title}</p>
      <p className="text-xs text-cyan-500/50 mt-1">{chapter.objective}</p>
      <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="text-[10px] text-cyan-500/40 mt-1 font-mono">
        {progress.current}/{progress.target} · +{chapter.xp_reward} XP · +{chapter.coin_reward} coins
      </p>
    </div>
  );
}
