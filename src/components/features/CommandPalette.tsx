"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { jarvisFetch } from "@/lib/api-client";
import { useFocusMode } from "@/contexts/FocusModeContext";
import {
  LayoutDashboard,
  BarChart3,
  Dumbbell,
  Scroll,
  Settings,
  Shield,
  Trophy,
  Coins,
  CalendarDays,
  LineChart,
  Bot,
  Pin,
  Zap,
} from "lucide-react";

const NAV_ACTIONS = [
  { label: "Command Center", href: "/app/desktop/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/app/desktop/analytics", icon: BarChart3 },
  { label: "Workout System", href: "/app/desktop/workout", icon: Dumbbell },
  { label: "Quests", href: "/app/desktop/quests", icon: Scroll },
  { label: "Stats", href: "/app/desktop/stats", icon: Shield },
  { label: "Trophy Room", href: "/app/desktop/trophy", icon: Trophy },
  { label: "Shadow Shop", href: "/app/desktop/shop", icon: Coins },
  { label: "Weekly Review", href: "/app/desktop/weekly", icon: CalendarDays },
  { label: "Timeline", href: "/app/desktop/timeline", icon: LineChart },
  { label: "JARVIS Coach", href: "/app/desktop/coach", icon: Bot },
  { label: "Settings", href: "/app/desktop/settings", icon: Settings },
  { label: "Year Recap", href: "/app/desktop/year-recap", icon: Trophy },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const stats = useGameStore((s) => s.stats);
  const router = useRouter();
  const { toggleFocusMode } = useFocusMode();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
      if (e.key === "m" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        router.push("/app/mobile/mission");
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const refetch = useCallback(async () => {
    const dash = await jarvisFetch("/api/dashboard");
    if (dash.ok) {
      useGameStore.getState().setStats(await dash.json());
    }
  }, []);

  const logHabit = useCallback(
    async (habitId: string) => {
      await jarvisFetch("/api/habits/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, completed: true }),
      });
      setOpen(false);
      setQuery("");
      await refetch();
    },
    [refetch]
  );

  const pinQuest = useCallback(async () => {
    const firstActive = stats?.quests.find((q) => q.status === "active");
    if (!firstActive) return;
    setOpen(false);
    router.push("/app/desktop/quests");
  }, [stats, router]);

  const startWorkout = useCallback(() => {
    router.push("/app/desktop/workout");
    setOpen(false);
  }, [router]);

  const handleFocusMode = useCallback(() => {
    toggleFocusMode();
    setOpen(false);
  }, [toggleFocusMode]);

  const q = query.toLowerCase();

  const matchedHabits = (stats?.habits ?? []).filter(
    (h) => h.is_active && !h.completed_today && h.name.toLowerCase().includes(q)
  );

  const matchedNav = NAV_ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(q)
  );

  const startBossRush = useCallback(async () => {
    await jarvisFetch("/api/boss-rush", { method: "POST" });
    setOpen(false);
    await refetch();
  }, [refetch]);

  const shareWeek = useCallback(() => {
    window.open("/api/share/weekly", "_blank");
    setOpen(false);
  }, []);

  const printDossier = useCallback(() => {
    window.open("/api/reports/print", "_blank");
    setOpen(false);
  }, []);

  const logWater = useCallback(async () => {
    await jarvisFetch("/api/hydration", { method: "POST", body: JSON.stringify({ ml: 500 }) });
    setOpen(false);
    await refetch();
  }, [refetch]);

  const specialActions = [
    { label: "Pin active quest", action: pinQuest, icon: Pin },
    { label: "Start workout", action: startWorkout, icon: Dumbbell },
    { label: "Start boss rush", action: startBossRush, icon: Zap },
    { label: "Share weekly recap", action: shareWeek, icon: Zap },
    { label: "Print dossier", action: printDossier, icon: Zap },
    { label: "Log 500ml water", action: logWater, icon: Zap },
    { label: "Today mission mode", action: () => { router.push("/app/mobile/mission"); setOpen(false); }, icon: Zap },
    { label: "Toggle focus mode", action: handleFocusMode, icon: Zap },
  ].filter((a) => !q || a.label.toLowerCase().includes(q));

  if (typeof window !== "undefined" && window.innerWidth < 768) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-lg glass rounded-xl overflow-hidden border border-cyan-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Log habit, navigate, or run action… (⌘K)"
              className="w-full px-4 py-4 bg-transparent text-cyan-50 placeholder:text-cyan-500/40 outline-none border-b border-cyan-500/20"
            />
            <div className="max-h-72 overflow-y-auto p-2">
              {matchedHabits.slice(0, 5).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => void logHabit(h.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-sm text-cyan-100 flex items-center gap-2"
                >
                  <span className="text-cyan-400 text-xs">✓</span>
                  Complete: {h.name}
                </button>
              ))}

              {specialActions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => void a.action()}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-500/10 text-sm text-purple-200 flex items-center gap-2"
                >
                  <a.icon className="w-3.5 h-3.5 text-purple-400" />
                  {a.label}
                </button>
              ))}

              {matchedNav.map((a) => (
                <button
                  key={a.href}
                  type="button"
                  onClick={() => {
                    router.push(a.href);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-sm text-cyan-100/60 flex items-center gap-2"
                >
                  <a.icon className="w-3.5 h-3.5 text-cyan-500/60" />
                  → {a.label}
                </button>
              ))}

              {!matchedHabits.length && !matchedNav.length && !specialActions.length && (
                <p className="text-center text-sm text-cyan-500/40 py-6">
                  No results for &quot;{query}&quot;
                </p>
              )}
            </div>
            <div className="px-4 py-2 border-t border-cyan-500/10 text-[10px] text-cyan-500/30 flex gap-4">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>ESC close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
