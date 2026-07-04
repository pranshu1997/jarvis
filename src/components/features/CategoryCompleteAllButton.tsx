"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useToastStore } from "@/stores/toast-store";

export function CategoryCompleteAllButton({ categorySlug, label }: { categorySlug: string; label: string }) {
  const { refetch } = useDashboard();
  const [loading, setLoading] = useState(false);

  const completeAll = async () => {
    setLoading(true);
    const res = await jarvisFetch("/api/habits/complete-category", {
      method: "POST",
      body: JSON.stringify({ categorySlug }),
    });
    const d = await res.json();
    setLoading(false);
    if (res.ok) {
      useToastStore.getState().show(`+${d.xpEarned} XP · ${d.completed} habits`, "success");
      refetch();
    }
  };

  return (
    <Button size="sm" variant="ghost" className="text-[10px] h-7" disabled={loading} onClick={completeAll}>
      Complete all {label}
    </Button>
  );
}
