import Link from "next/link";
import { LayoutGrid } from "lucide-react";

const NEXUS_URL = "http://127.0.0.1:3100";

export function BackToNexus() {
  return (
    <Link
      href={NEXUS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-cyan-500/50 no-underline hover:text-cyan-400 px-3"
    >
      <LayoutGrid className="w-3 h-3" />
      Back to Nexus
    </Link>
  );
}
