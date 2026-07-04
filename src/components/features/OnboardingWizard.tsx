"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";

const STEPS = [
  { title: "Welcome, Hunter", body: "Forge tracks your evolution across 4 pillars. Let's configure your protocol." },
  { title: "Weekly Focus", body: "Pick your primary focus category for this week." },
  { title: "Priority Habits", body: "Pin up to 3 habits you'll protect streaks on." },
  { title: "Morning Mode", body: "Route to quick-today view each morning until habits are logged?" },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState("physical");
  const [morningMode, setMorningMode] = useState(true);
  const [open, setOpen] = useState(false);
  const [habits, setHabits] = useState<{ id: string; name: string }[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    jarvisFetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        const completed = (data.profile?.settings as { onboarding_completed?: boolean })?.onboarding_completed;
        if (!completed) {
          setOpen(true);
          setHabits(
            (data.habits ?? [])
              .filter((h: { is_active: boolean }) => h.is_active)
              .slice(0, 8)
              .map((h: { id: string; name: string }) => ({ id: h.id, name: h.name }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const finish = async () => {
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({
        weeklyFocus: focus,
        onboardingCompleted: true,
        morningMode,
      }),
    });
    for (const id of pinned) {
      await jarvisFetch("/api/habits/pin", {
        method: "POST",
        body: JSON.stringify({ habitId: id, pinned: true }),
      });
    }
    setOpen(false);
    window.location.reload();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="w-full max-w-md glass rounded-2xl p-6 border border-cyan-500/30"
        >
          <p className="text-[10px] uppercase tracking-widest text-cyan-500/50">
            Step {step + 1}/{STEPS.length}
          </p>
          <h2 className="font-display text-xl font-bold text-cyan-100 mt-1">
            {STEPS[step].title}
          </h2>
          <p className="text-sm text-cyan-500/60 mt-2">{STEPS[step].body}</p>

          {step === 1 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {["physical", "mental", "awareness", "vitality"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFocus(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize border ${
                    focus === c ? "border-cyan-400 bg-cyan-500/20" : "border-cyan-500/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
              {habits.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() =>
                    setPinned((p) =>
                      p.includes(h.id)
                        ? p.filter((x) => x !== h.id)
                        : p.length < 3
                          ? [...p, h.id]
                          : p
                    )
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${
                    pinned.includes(h.id) ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/20"
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <label className="flex items-center gap-3 mt-4 text-sm text-cyan-100">
              <input
                type="checkbox"
                checked={morningMode}
                onChange={(e) => setMorningMode(e.target.checked)}
              />
              Enable morning entry mode
            </label>
          )}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => (step > 0 ? setStep(step - 1) : setOpen(false))}
            >
              {step > 0 ? "Back" : "Skip"}
            </Button>
            <Button
              type="button"
              variant="hologram"
              size="sm"
              onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : void finish())}
            >
              {step < STEPS.length - 1 ? "Next" : "Begin Hunt"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
