"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  LineChart,
  Scroll,
  Settings,
  Shield,
  Swords,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RankBadge } from "@/components/shared/RankBadge";
import { useGameStore } from "@/stores/game-store";
import { xpProgressInLevel } from "@/lib/xp-engine";
import { XpBar } from "@/components/effects/XpBar";

const NAV = [
  { href: "/app/desktop/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/app/desktop/quests", label: "Quests", icon: Scroll },
  { href: "/app/desktop/stats", label: "Stats", icon: Shield },
  { href: "/app/desktop/workout", label: "Workout", icon: Dumbbell },
  { href: "/app/desktop/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/desktop/timeline", label: "Timeline", icon: LineChart },
  { href: "/app/desktop/profile", label: "Profile", icon: User },
  { href: "/app/desktop/settings", label: "Settings", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const stats = useGameStore((s) => s.stats);
  const profile = stats?.profile;
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

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
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
      </nav>

      <div className="p-4 border-t border-cyan-500/10">
        <Link
          href="/app/mobile/dashboard"
          className="flex items-center gap-2 text-xs text-cyan-500/50 hover:text-cyan-400"
        >
          <Swords className="w-3 h-3" />
          Switch to Mobile HUD
        </Link>
      </div>
    </aside>
  );
}
