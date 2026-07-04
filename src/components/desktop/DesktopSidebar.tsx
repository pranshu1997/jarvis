"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  CalendarDays,
  LineChart,
  Scroll,
  Settings,
  Shield,
  Swords,
  User,
  Trophy,
  Coins,
  Bot,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RankBadge } from "@/components/shared/RankBadge";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BackToNexus } from "@/components/shared/BackToNexus";
import { useGameStore } from "@/stores/game-store";
import { xpProgressInLevel } from "@/lib/xp-engine";
import { AppOpenStreakBadge } from "@/components/features/AppOpenStreakBadge";
import { WeekXpSparkline } from "@/components/features/WeekXpSparkline";
import { ResilienceBadge } from "@/components/features/ResilienceBadge";
import { XpBar } from "@/components/effects/XpBar";

const NAV_SECTIONS = [
  {
    label: "Command",
    items: [
      { href: "/app/desktop/dashboard", label: "Command Center", icon: LayoutDashboard },
      { href: "/app/desktop/quests", label: "Quests", icon: Scroll },
      { href: "/app/desktop/coach", label: "JARVIS Coach", icon: Bot },
      { href: "/app/desktop/weekly", label: "Weekly Review", icon: CalendarDays },
    ],
  },
  {
    label: "Body",
    items: [
      { href: "/app/desktop/stats", label: "Stats", icon: Shield },
      { href: "/app/desktop/workout", label: "Workout", icon: Dumbbell },
      { href: "/app/desktop/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/app/desktop/timeline", label: "Timeline", icon: LineChart },
    ],
  },
  {
    label: "Meta",
    items: [
      { href: "/app/desktop/trophy", label: "Trophy Room", icon: Trophy },
      { href: "/app/desktop/shop", label: "Shadow Shop", icon: Coins },
      { href: "/app/desktop/year-recap", label: "Year Recap", icon: Sparkles },
      { href: "/app/desktop/profile", label: "Profile", icon: User },
      { href: "/app/desktop/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const stats = useGameStore((s) => s.stats);
  const profile = stats?.profile;
  const coins = stats?.meta?.shadowCoins ?? 0;
  const xp = profile
    ? xpProgressInLevel(profile.total_xp, profile.player_level)
    : { current: 0, required: 100, percent: 0 };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-cyan-500/20 flex flex-col z-40">
      <div className="p-6 border-b border-cyan-500/10">
        <Link href="/app/desktop/dashboard" className="block">
          <h1 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
            JARVIS
          </h1>
          <p className="text-[10px] text-cyan-500/50 uppercase tracking-[0.3em] mt-1">
            Command Center
          </p>
        </Link>
      </div>

      {profile && (
        <div className="p-4 border-b border-cyan-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-cyan-100">
              {profile.display_name ?? "Hunter"}
            </span>
            <RankBadge rank={profile.rank} size="sm" />
          </div>
          <XpBar
            label="Player XP"
            current={xp.current}
            required={xp.required}
            percent={xp.percent}
            level={profile.player_level}
            size="sm"
          />
          <p className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {coins} Shadow Coins
          </p>
          <AppOpenStreakBadge />
          <ResilienceBadge />
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Power", value: profile.power_score },
              { label: "Discipline", value: profile.discipline_score },
              { label: "Momentum", value: profile.momentum_score },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-800/50 p-2">
                <p className="text-[10px] text-cyan-500/50">{s.label}</p>
                <p className="text-sm font-mono text-cyan-300">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-500/30 px-3 mb-1">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-cyan-500/15 text-cyan-200 border border-cyan-500/30"
                          : "text-cyan-100/50 hover:text-cyan-100 hover:bg-white/5"
                      )}
                      whileHover={{ x: 4 }}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <WeekXpSparkline />

      <div className="p-4 border-t border-cyan-500/10 space-y-2">
        <BackToNexus />
        <Link
          href="/app/mobile/dashboard"
          className="flex items-center gap-2 text-xs text-cyan-500/50 hover:text-cyan-400 px-3"
        >
          <Swords className="w-3 h-3" />
          Switch to Mobile HUD
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
