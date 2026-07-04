"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { CalendarHeatmap } from "@/components/features/CalendarHeatmap";
import { EmptyState } from "@/components/features/EmptyState";
import { SkeletonDashboard } from "@/components/ui/SkeletonLoader";
import { Trophy, Zap, Flame, Target, Star } from "lucide-react";

export default function YearRecapPage() {
  const { stats, isLoading } = useDashboard();

  const recap = useMemo(() => {
    if (!stats) return null;

    const year = new Date().getFullYear().toString();
    const yearEvents = stats.recentXpEvents.filter((e) =>
      e.created_at.startsWith(year)
    );

    const totalXp = yearEvents.reduce((s, e) => s + e.final_xp, 0);
    const totalHabitsCompleted = yearEvents.length;
    const longestStreak = Math.max(...stats.habits.map((h) => h.longest_streak ?? 0), 0);
    const topHabit = stats.habits.reduce(
      (best, h) => ((h.current_streak ?? 0) > (best?.current_streak ?? 0) ? h : best),
      stats.habits[0]
    );

    const categoryBreakdown = stats.categories.map((c) => ({
      name: c.name,
      color: c.color,
      xp: c.total_xp,
      pct: totalXp > 0 ? Math.round((c.total_xp / totalXp) * 100) : 0,
    })).sort((a, b) => b.xp - a.xp);

    const rankProgression = stats.profile.rank;

    return {
      totalXp,
      totalHabitsCompleted,
      longestStreak,
      topHabit,
      categoryBreakdown,
      rankProgression,
      level: stats.profile.player_level,
    };
  }, [stats]);

  if (isLoading) return <SkeletonDashboard />;

  if (!stats || !recap) {
    return (
      <div className="p-8">
        <EmptyState icon="📅" title="No data yet" description="Complete habits to build your year recap." />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total XP Earned",
      value: recap.totalXp.toLocaleString(),
      icon: Zap,
      color: "text-amber-400",
    },
    {
      label: "Habits Completed",
      value: recap.totalHabitsCompleted.toLocaleString(),
      icon: Target,
      color: "text-cyan-400",
    },
    {
      label: "Longest Streak",
      value: `${recap.longestStreak} days`,
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "Current Rank",
      value: recap.rankProgression,
      icon: Star,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="flex justify-center mb-4">
          <Trophy className="w-16 h-16 text-amber-400" />
        </div>
        <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-400">
          {new Date().getFullYear()} Year in Review
        </h1>
        <p className="text-cyan-500/50 mt-2">
          Level {recap.level} — {recap.rankProgression} Rank
        </p>
      </motion.header>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card glow>
              <CardContent className="pt-6 text-center space-y-2">
                <card.icon className={`w-8 h-8 mx-auto ${card.color}`} />
                <p className="font-display text-2xl font-bold text-cyan-100">
                  {card.value}
                </p>
                <p className="text-xs text-cyan-500/50">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {recap.topHabit && (
        <Card glow>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Top Habit of the Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-display font-bold text-cyan-100">
                  {recap.topHabit.name}
                </p>
                <p className="text-cyan-500/50 text-sm mt-1">
                  {recap.topHabit.current_streak} day streak
                </p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>XP by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recap.categoryBreakdown.length > 0 ? (
            recap.categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: cat.color }}>{cat.name}</span>
                  <span className="text-cyan-500/60 font-mono">
                    {cat.xp.toLocaleString()} XP ({cat.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.pct}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon="📊" title="No category data" description="Complete habits to see breakdown." />
          )}
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarHeatmap stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
