"use client";

import { useEffect, useState } from "react";
import { getQueueLength, flushQueue } from "@/lib/offline-queue";
import { CloudOff } from "lucide-react";

export function OfflineQueueBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getQueueLength());
    update();
    window.addEventListener("online", update);
    const t = setInterval(update, 5000);
    return () => {
      window.removeEventListener("online", update);
      clearInterval(t);
    };
  }, []);

  if (count === 0) return null;

  const flush = async () => {
    await flushQueue();
    setCount(getQueueLength());
  };

  return (
    <button
      type="button"
      onClick={() => void flush()}
      className="flex items-center gap-1 text-[10px] text-amber-400/80 hover:text-amber-300"
      title="Tap to sync queued actions"
    >
      <CloudOff className="w-3 h-3" />
      {count} queued
    </button>
  );
}
