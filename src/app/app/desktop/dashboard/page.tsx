"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CategoryGrid } from "@/components/features/CategoryGrid";
import { HabitList } from "@/components/features/HabitList";
import { PlayerHeader } from "@/components/features/PlayerHeader";
import { QuestPanel } from "@/components/features/QuestPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";

const XP_CHART = [
  { day: "Mon", xp: 120 },
  { day: "Tue", xp: 185 },
  { day: "Wed", xp: 240 },
  { day: "Thu", xp: 195 },
  { day: "Fri", xp: 310 },
  { day: "Sat", xp: 285 },
  { day: "Sun", xp: 350 },
];

export default function DesktopDashboard() {
  const { stats, completeHabit } = useDashboard();
  const isLoading = useGameStore((s) => s.isLoading);

  if (isLoading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-dvh">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="font-display text-cyan-400 text-xl"
        >
          Initializing Command Center...
        </motion.div>
      </div>
    );
  }

  const dailyQuests = stats.quests.filter((q) => q.quest_type === "daily");

  return (
    <div className="p-8 space-y-8">
      <PlayerHeader profile={stats.profile} />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <section>
            <h3 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
              Category Matrix
            </h3>
            <CategoryGrid categories={stats.categories} />
          </section>

          <div className="grid grid-cols-2 gap-6">
            {stats.categories.map((cat) => (
              <Card key={cat.id} glow>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span style={{ color: cat.color }}>{cat.name}</span>
                    <span className="text-xs text-cyan-500/40 font-mono">
                      Habits
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HabitList
                    habits={stats.habits}
                    categorySlug={cat.slug}
                    onToggle={completeHabit}
                    compact
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <Card glow>
            <CardHeader>
              <CardTitle>XP Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={XP_CHART}>
                  <defs>
                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "#67e8f9", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#67e8f9", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(0,212,255,0.3)",
                      borderRadius: 8,
                    }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#00d4ff" fill="url(#xpGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <section>
            <h3 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
              Active Quests
            </h3>
            <QuestPanel quests={dailyQuests.slice(0, 4)} compact />
          </section>

          {stats.dailyCompletion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today&apos;s Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold text-cyan-300">
                  {stats.dailyCompletion.completed_habits}
                  <span className="text-cyan-500/40 text-lg">
                    /{stats.dailyCompletion.total_habits}
                  </span>
                </p>
                <p className="text-sm text-cyan-500/50 mt-1">
                  +{stats.dailyCompletion.total_xp} XP earned today
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
