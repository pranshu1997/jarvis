"use client";

import Link from "next/link";
import { Trophy, ShoppingBag, CalendarDays, BarChart3, Bot, ChevronRight } from "lucide-react";
import { MobileMoreSwipe } from "@/components/mobile/MobileMoreSwipe";

const MORE_LINKS = [
  { href: "/app/mobile/trophy", icon: Trophy, label: "Trophy Room", description: "Achievements & resilience", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { href: "/app/mobile/shop", icon: ShoppingBag, label: "Shadow Shop", description: "Redeem shadow coins", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { href: "/app/mobile/weekly", icon: CalendarDays, label: "Weekly Review", description: "Plan next evolution", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { href: "/app/mobile/analytics", icon: BarChart3, label: "Analytics", description: "XP charts & heatmap", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { href: "/app/mobile/coach", icon: Bot, label: "JARVIS Coach", description: "AI advisor", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
];

export default function MobileMorePage() {
  return (
    <MobileMoreSwipe>
      <div className="space-y-6 pt-4">
        <header>
          <h1 className="font-display text-xl font-bold text-cyan-100">More</h1>
          <p className="text-[11px] text-cyan-500/50 mt-0.5">Swipe or tap — advanced modules</p>
        </header>
        <div className="space-y-3">
          {MORE_LINKS.map(({ href, icon: Icon, label, description, color, bg }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 p-4 rounded-xl border ${bg}`}
            >
              <Icon className={`w-6 h-6 ${color}`} />
              <div className="flex-1">
                <p className="font-medium text-cyan-100">{label}</p>
                <p className="text-[11px] text-cyan-500/50">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-500/30" />
            </Link>
          ))}
        </div>
      </div>
    </MobileMoreSwipe>
  );
}
