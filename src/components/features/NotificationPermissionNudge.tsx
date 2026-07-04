"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export function NotificationPermissionNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    const dismissed = localStorage.getItem("jarvis_notif_nudge");
    if (dismissed) return;
    setShow(true);
  }, []);

  if (!show) return null;

  const enable = async () => {
    await Notification.requestPermission();
    localStorage.setItem("jarvis_notif_nudge", "1");
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem("jarvis_notif_nudge", "1");
    setShow(false);
  };

  return (
    <div className="mx-4 mt-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 flex items-center gap-3">
      <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-cyan-100">Enable notifications for quest expiry alerts</p>
      </div>
      <button type="button" onClick={() => void enable()} className="text-[10px] text-cyan-300 border border-cyan-400/40 px-2 py-1 rounded-full">
        Enable
      </button>
      <button type="button" onClick={dismiss} className="text-cyan-500/40 text-xs">✕</button>
    </div>
  );
}
