"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4 space-y-3",
        className
      )}
    >
      {icon && <span className="text-4xl">{icon}</span>}
      <h3 className="font-display font-semibold text-cyan-100/70">{title}</h3>
      {description && (
        <p className="text-sm text-cyan-500/50 max-w-xs">{description}</p>
      )}
      {action && (
        <Button
          variant="hologram"
          size="sm"
          className="mt-2"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
