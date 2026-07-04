"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-cyan-500/10 motion-reduce:animate-none",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-cyan-500/10 bg-slate-900/50 p-4 space-y-3",
        className
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

export function SkeletonHabitRow() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonHabitGrid({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonHabitRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-8 space-y-8 animate-pulse motion-reduce:animate-none">
      <div className="glass rounded-2xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="col-span-4 space-y-4">
          {[0, 1].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonMobileDashboard() {
  return (
    <div className="space-y-6 pt-4 animate-pulse motion-reduce:animate-none">
      <SkeletonCard className="h-28" />
      <SkeletonCard className="h-16" />
      <SkeletonHabitGrid rows={6} />
    </div>
  );
}
