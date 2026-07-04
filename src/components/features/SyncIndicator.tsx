"use client";

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfflineQueueBadge } from "@/components/features/OfflineQueueBadge";

interface SyncIndicatorProps {
  onRefresh: () => Promise<void> | void;
  className?: string;
}

export function SyncIndicator({ onRefresh, className }: SyncIndicatorProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(new Date());

  const handleRefresh = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await onRefresh();
      setLastSynced(new Date());
    } finally {
      setSyncing(false);
    }
  }, [syncing, onRefresh]);

  const label = lastSynced
    ? formatRelative(lastSynced)
    : "never";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <OfflineQueueBadge />
      <button
      type="button"
      onClick={() => void handleRefresh()}
      className={cn(
        "flex items-center gap-1.5 text-xs text-cyan-500/50 hover:text-cyan-400 transition-colors",
        className
      )}
      title="Refresh dashboard"
    >
      <RefreshCw
        className={cn(
          "w-3 h-3 transition-transform",
          syncing && "animate-spin"
        )}
      />
      {syncing ? "Syncing…" : `Synced ${label}`}
    </button>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
