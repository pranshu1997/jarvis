"use client";

import { Printer } from "lucide-react";

export function PrintableDossierButton() {
  return (
    <a
      href="/api/reports/print"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
    >
      <Printer className="w-3.5 h-3.5" />
      Print dossier
    </a>
  );
}
