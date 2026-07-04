"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jarvisFetch } from "@/lib/api-client";

export function SundayCoachBrief() {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState("");

  useEffect(() => {
    const day = new Date().getDay();
    if (day !== 0) return;
    const key = `jarvis_sunday_brief_${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(key)) return;

    jarvisFetch("/api/coach/brief")
      .then((r) => r.json())
      .then((d) => {
        if (d.brief) {
          setBrief(d.brief);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    const key = `jarvis_sunday_brief_${new Date().toISOString().slice(0, 10)}`;
    sessionStorage.setItem(key, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && brief && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
          >
            <p className="text-xs uppercase tracking-widest text-cyan-500/50 mb-3">Sunday Brief</p>
            <pre className="text-sm text-cyan-100/80 whitespace-pre-wrap font-sans">{brief}</pre>
            <button type="button" onClick={dismiss} className="mt-4 text-xs text-cyan-400 w-full text-center">
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
