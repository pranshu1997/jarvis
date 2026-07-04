"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToastStore } from "@/stores/toast-store";
import { useGameStore } from "@/stores/game-store";

const SESSION_FLAG = "jarvis_session_active";
const LAST_USERNAME_KEY = "jarvis_last_username";

export { LAST_USERNAME_KEY };

/** Validates session; logs out only when the page is actually unloaded (not bfcache). */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const checked = useRef(false);

  useEffect(() => {
    const onPageHide = (e: PageTransitionEvent) => {
      // Back-forward cache: user may return — keep session alive
      if (e.persisted) return;
      sessionStorage.removeItem(SESSION_FLAG);
      navigator.sendBeacon("/api/auth/logout");
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      sessionStorage.removeItem(SESSION_FLAG);
      useGameStore.getState().setStats(null);
      useToastStore
        .getState()
        .show("Session expired — please log in again", "error");
      router.replace("/");
    };

    window.addEventListener("jarvis-unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("jarvis-unauthorized", onUnauthorized);
  }, [router]);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    async function verify() {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = await res.json();

      if (!data.localMode) return;

      if (!data.authenticated) {
        sessionStorage.removeItem(SESSION_FLAG);
        if (pathname.startsWith("/app")) {
          router.replace("/");
        }
        return;
      }

      if (data.demo) {
        sessionStorage.removeItem(SESSION_FLAG);
        router.replace("/");
        return;
      }

      sessionStorage.setItem(SESSION_FLAG, "1");
      if (data.user?.username) {
        localStorage.setItem(LAST_USERNAME_KEY, data.user.username);
      }
    }

    if (pathname.startsWith("/app")) {
      void verify();
    }
  }, [pathname, router]);

  return <>{children}</>;
}
