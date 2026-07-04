"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jarvisFetch } from "@/lib/api-client";
import { useGameStore } from "@/stores/game-store";
import { useToastStore } from "@/stores/toast-store";
import { Suspense } from "react";

function DeepLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get("action");
    const habitId = searchParams.get("habitId");
    const redirect = searchParams.get("redirect") ?? "/app";

    if (!action) {
      router.replace(redirect);
      return;
    }

    const handle = async () => {
      switch (action) {
        case "complete-habit": {
          if (!habitId) break;
          const res = await jarvisFetch("/api/habits/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ habitId, completed: true }),
          });
          if (res.ok) {
            useToastStore.getState().show("Habit completed!", "success");
            useGameStore.getState().setUndoUntil(Date.now() + 30_000);
            const dash = await jarvisFetch("/api/dashboard");
            if (dash.ok) useGameStore.getState().setStats(await dash.json());
          } else {
            useToastStore.getState().show("Failed to complete habit", "error");
          }
          break;
        }
        case "open-workout": {
          router.replace("/app/desktop/workout");
          return;
        }
        case "open-quests": {
          router.replace("/app/desktop/quests");
          return;
        }
        case "open-mission": {
          router.replace("/app/mobile/mission");
          return;
        }
        case "boss-rush": {
          await jarvisFetch("/api/boss-rush", { method: "POST" });
          useToastStore.getState().show("Boss Rush started!", "celebration");
          break;
        }
        case "open-today": {
          router.replace("/app/mobile/today");
          return;
        }
        default:
          break;
      }
      router.replace(redirect);
    };

    void handle();
  }, [searchParams, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <p className="font-display text-cyan-400 animate-pulse">Executing…</p>
    </div>
  );
}

export default function DeepLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          <p className="font-display text-cyan-400 animate-pulse">Loading…</p>
        </div>
      }
    >
      <DeepLinkHandler />
    </Suspense>
  );
}
