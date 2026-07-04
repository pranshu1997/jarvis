"use client";

import { Download } from "lucide-react";

export function ActivityExportButton() {
  return (
    <a
      href="/api/analytics/activity-export"
      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
    >
      <Download className="w-3.5 h-3.5" />
      Export activity CSV
    </a>
  );
}
