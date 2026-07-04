"use client";

import { useEffect, useState } from "react";

/** Tablet breakpoint: 768–1024px gets hybrid layout hints */
export function useTabletLayout(): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsTablet(w >= 768 && w < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isTablet;
}
