"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";

const EMOJIS = ["⚔️", "🛡️", "🔥", "👁️", "💎", "🌙", "⚡", "🎯"];

export function ProfileCustomizer() {
  const stats = useGameStore((s) => s.stats);
  const { refetch } = useDashboard();
  const ext = stats ? getExtended(stats.profile) : null;
  const [avatar, setAvatar] = useState(ext?.profile_avatar ?? "⚔️");
  const [title, setTitle] = useState(ext?.profile_title ?? "Hunter");

  const save = async () => {
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ profile_avatar: avatar, profile_title: title }),
    });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-cyan-500/50 mb-2">Avatar</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setAvatar(e)}
              className={`text-2xl p-2 rounded-lg border ${avatar === e ? "border-cyan-400 bg-cyan-500/10" : "border-transparent"}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-cyan-500/50 mb-1">Hunter Title</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-cyan-950/30 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-cyan-100"
          maxLength={24}
        />
      </div>
      <button type="button" onClick={save} className="text-xs text-cyan-400 hover:text-cyan-300">
        Save profile
      </button>
    </div>
  );
}
