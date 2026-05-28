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
import { ProtocolStrip } from "@/components/features/ProtocolStrip";
import { SupplementStack } from "@/components/features/SupplementStack";
import { SupplementOverallCard } from "@/components/features/SupplementOverallCard";
import { QuantifiedRings } from "@/components/features/QuantifiedRings";
import { QuantifiedProgressPanel } from "@/components/features/QuantifiedProgressPanel";
import { CategoryCompleteCelebration } from "@/components/features/CategoryCompleteCelebration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { CustomHabitDialog } from "@/components/features/CustomHabitDialog";
import { ComboMeter } from "@/components/features/ComboMeter";
import { ActiveQuestPin } from "@/components/features/ActiveQuestPin";
import {
  FocusModePanel,
  FocusModeToggle,
} from "@/components/features/FocusModeStrip";
import { ReadinessStrip } from "@/components/features/ReadinessStrip";
import { DungeonBossBar } from "@/components/features/DungeonBossBar";
import { RoutinePanel } from "@/components/features/RoutinePanel";
import { useMemo } from "react";

export default function DesktopDashboard() {
  const {
    stats,
    completeHabit,
    incrementHabit,
    toggleSupplement,
    categoryCelebration,
    dismissCategoryCelebration,
    refetch,
    isLoading,
  } = useDashboard();

  const xpChart = useMemo(() => {
    if (!stats?.recentXpEvents.length) return [];
    const byDay: Record<string, number> = {};
    for (const e of [...stats.recentXpEvents].reverse()) {
      const day = e.created_at.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + e.final_xp;
    }
    return Object.entries(byDay)
      .slice(-7)
      .map(([day, xp]) => ({
        day: day.slice(5),
        xp,
      }));
  }, [stats?.recentXpEvents]);

  if (isLoading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-dvh">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="font-display text-cyan-400 text-xl"
        >
          Initializing Command Center...
        </motion.p>
      </div>
    );
  }

  const dailyQuests = stats.quests.filter((q) => q.quest_type === "daily");

  return (
    <div className="p-8 space-y-8">
      <CategoryCompleteCelebration
        categoryName={categoryCelebration}
        onDismiss={dismissCategoryCelebration}
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PlayerHeader profile={stats.profile} />
            <div className="flex flex-wrap items-center gap-2">
              <ComboMeter stats={stats} />
              <FocusModeToggle />
            </div>
          </div>
          <FocusModePanel
            onComplete={completeHabit}
            onIncrement={incrementHabit}
            onSupplement={toggleSupplement}
          />
          {stats.meta?.dungeon && <DungeonBossBar dungeon={stats.meta.dungeon} />}
          <ReadinessStrip
            initial={
              (stats.meta?.readiness as import("@/lib/player-settings-extended").ReadinessEntry | null) ??
              null
            }
            onLogged={refetch}
          />
          {stats.meta?.adaptive && stats.meta.adaptive.length > 0 && (
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-xs text-purple-200/80">
              {stats.meta.adaptive[0].message}
            </div>
          )}
          {stats.meta?.shadowCoins != null && (
            <p className="text-xs font-mono text-amber-400/80">
              {stats.meta.shadowCoins} Shadow Coins
            </p>
          )}
          <ProtocolStrip stats={stats} />
          <RoutinePanel stats={stats} onComplete={completeHabit} onRoutineDone={refetch} />
          <QuantifiedRings habits={stats.habits} />
          <QuantifiedProgressPanel habits={stats.habits} onAdjust={incrementHabit} />
          <section>
            <div className="flex items-center justify-between mb-4 gap-4">
              <h3 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50">
                Category Matrix
              </h3>
              <CustomHabitDialog habits={stats.habits} onCreated={refetch} />
            </div>
            <CategoryGrid categories={stats.categories} />
          </section>
          <div className="grid grid-cols-2 gap-6">
            {stats.categories.map((cat) => (
              <Card key={cat.id} glow>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span style={{ color: cat.color }}>{cat.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HabitList
                    habits={stats.habits}
                    allHabits={stats.habits}
                    categorySlug={cat.slug}
                    onToggle={completeHabit}
                    onIncrement={incrementHabit}
                    compact
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="col-span-4 space-y-6">
          <SupplementOverallCard supplements={stats.supplements} />
          <SupplementStack
            supplements={stats.supplements}
            onToggle={toggleSupplement}
          />
          <Card glow>
            <CardHeader>
              <CardTitle>XP Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              {xpChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={xpChart}>
                    <defs>
                      <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: "#67e8f9", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#67e8f9", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="xp" stroke="#00d4ff" fill="url(#xpGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-cyan-500/40 text-center py-8">
                  Complete habits to see XP velocity
                </p>
              )}
            </CardContent>
          </Card>
          <ActiveQuestPin stats={stats} onUpdate={refetch} />
          <QuestPanel quests={dailyQuests.slice(0, 4)} compact />
        </div>
      </div>
    </div>
  );
}
