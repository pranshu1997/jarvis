"use client";

import { useState, useRef, type ReactNode } from "react";

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}) {
  const [pulling, setPulling] = useState(false);
  const startY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) startY.current = e.touches[0]!.clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current && e.touches[0]!.clientY - startY.current > 80) {
      setPulling(true);
    }
  };

  const onTouchEnd = async () => {
    if (pulling) {
      setPulling(false);
      await onRefresh();
    }
    startY.current = 0;
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => void onTouchEnd()}>
      {pulling && (
        <p className="text-center text-xs text-cyan-500/50 py-2 animate-pulse">Release to refresh</p>
      )}
      {children}
    </div>
  );
}
