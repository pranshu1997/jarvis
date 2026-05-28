"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?: "sidebar" | "mobile";
}

export function LogoutButton({ variant = "sidebar" }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    sessionStorage.removeItem("jarvis_session_active");
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  if (variant === "mobile") {
    return (
      <Button variant="ghost" size="sm" onClick={logout} className="text-cyan-500/50">
        <LogOut className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-cyan-100/40 hover:text-red-300 hover:bg-red-500/10 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Log Out
    </button>
  );
}
