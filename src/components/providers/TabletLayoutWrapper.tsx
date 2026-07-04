"use client";

import { useEffect } from "react";
import { useTabletLayout } from "@/hooks/useTabletLayout";

export function TabletLayoutWrapper({ children }: { children: React.ReactNode }) {
  const isTablet = useTabletLayout();

  useEffect(() => {
    document.documentElement.classList.toggle("tablet-layout", isTablet);
    return () => document.documentElement.classList.remove("tablet-layout");
  }, [isTablet]);

  return <>{children}</>;
}
