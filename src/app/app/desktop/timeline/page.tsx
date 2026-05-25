"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { formatDate } from "@/lib/utils";
import { Zap } from "lucide-react";

export default function DesktopTimelinePage() {
  const stats = useGameStore((s) => s.stats);
  const events = stats?.recentXpEvents ?? [];

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Progress Timeline
        </h1>
        <p className="text-cyan-500/50 mt-1">Your evolution history</p>
      </header>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />
        <div className="space-y-6">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-16"
            >
              <div className="absolute left-4 w-4 h-4 rounded-full bg-cyan-500 border-2 border-cyan-300 glow-cyan" />
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-cyan-100">
                    {event.reason ?? "XP Gained"}
                  </p>
                  <span className="flex items-center gap-1 text-cyan-400 font-mono text-sm">
                    <Zap className="w-3 h-3" />+{event.final_xp}
                  </span>
                </div>
                <p className="text-xs text-cyan-500/40 mt-1">
                  {formatDate(event.created_at)} · Base {event.base_xp} ×{" "}
                  {event.streak_multiplier}x streak
                </p>
              </div>
            </motion.div>
          ))}
          {events.length === 0 && (
            <p className="text-cyan-500/40 pl-16">No events yet. Start completing habits!</p>
          )}
        </div>
      </div>
    </div>
  );
}
