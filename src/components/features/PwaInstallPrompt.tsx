"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("jarvis_pwa_dismissed")) {
      setDismissed(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || !deferred) return null;
  if (typeof window !== "undefined" && window.innerWidth > 768) return null;

  const install = async () => {
    await deferred.prompt();
    setDeferred(null);
    localStorage.setItem("jarvis_pwa_dismissed", "1");
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 glass rounded-xl p-4 border border-cyan-500/30 md:hidden">
      <p className="text-sm text-cyan-100 mb-2">Install Jarvis for fullscreen HUD</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={install}>
          <Download className="w-4 h-4" />
          Add to Home Screen
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDismissed(true);
            localStorage.setItem("jarvis_pwa_dismissed", "1");
          }}
        >
          Later
        </Button>
      </div>
    </div>
  );
}
