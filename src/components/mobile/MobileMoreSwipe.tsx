"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGES = [
  { href: "/app/mobile/trophy", label: "Trophy" },
  { href: "/app/mobile/shop", label: "Shop" },
  { href: "/app/mobile/weekly", label: "Weekly" },
  { href: "/app/mobile/analytics", label: "Analytics" },
  { href: "/app/mobile/coach", label: "Coach" },
];

export function MobileMoreSwipe({ children }: { children: React.ReactNode }) {
  const [idx, setIdx] = useState(0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="p-2 text-cyan-500/50 disabled:opacity-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {PAGES.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => setIdx(i)}
              className={`text-[10px] px-2 py-1 rounded-full border ${
                i === idx ? "border-cyan-400 text-cyan-200" : "border-transparent text-cyan-500/40"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          disabled={idx === PAGES.length - 1}
          onClick={() => setIdx((i) => Math.min(PAGES.length - 1, i + 1))}
          className="p-2 text-cyan-500/50 disabled:opacity-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  );
}
