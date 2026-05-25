"use client";

import { useEffect, useState } from "react";
import { detectPlatform, type Platform } from "@/lib/device";
import { useGameStore } from "@/stores/game-store";

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const setStorePlatform = useGameStore((s) => s.setPlatform);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    setStorePlatform(detected);

    const handleResize = () => {
      const p = detectPlatform();
      setPlatform(p);
      setStorePlatform(p);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setStorePlatform]);

  return platform;
}
