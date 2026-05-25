"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  Scroll,
  Shield,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app/mobile/dashboard", label: "HUD", icon: LayoutDashboard },
  { href: "/app/mobile/quests", label: "Quests", icon: Scroll },
  { href: "/app/mobile/log", label: "Log", icon: Swords },
  { href: "/app/mobile/stats", label: "Stats", icon: Shield },
  { href: "/app/mobile/profile", label: "Profile", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-cyan-500/20 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className="flex-1">
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 py-2 rounded-xl",
                  active ? "text-cyan-300" : "text-cyan-100/40"
                )}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]")} />
                  {active && (
                    <motion.div
                      layoutId="mobile-tab-glow"
                      className="absolute -inset-2 rounded-full bg-cyan-500/20 -z-10"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
