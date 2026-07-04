"use client";

import { Share2 } from "lucide-react";

export function WeeklyShareButton() {
  const share = async () => {
    const url = `${window.location.origin}/api/share/weekly`;
    if (navigator.share) {
      await navigator.share({ title: "My Forge Week", url });
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <button type="button" onClick={() => void share()} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300">
      <Share2 className="w-3.5 h-3.5" />
      Share week
    </button>
  );
}
