"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import { useDashboard } from "@/hooks/useDashboard";
import { ShoppingBag, Coins } from "lucide-react";
import { MonarchSkillTree } from "@/components/features/MonarchSkillTree";
import { RankPerksPanel } from "@/components/features/RankPerksPanel";

interface ShopItem {
  id: string;
  title: string;
  cost: number;
}

export default function MobileShopPage() {
  const { refetch } = useDashboard();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [coins, setCoins] = useState(0);

  const load = async () => {
    const res = await jarvisFetch("/api/shop");
    const data = await res.json();
    if (res.ok) {
      setItems(data.items);
      setCoins(data.coins);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const buy = async (id: string) => {
    const res = await jarvisFetch("/api/shop", {
      method: "POST",
      body: JSON.stringify({ itemId: id }),
    });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show("Reward redeemed!", "celebration");
    setCoins(data.coins);
    refetch();
  };

  return (
    <div className="space-y-6 pt-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-cyan-100">Shadow Shop</h1>
            <p className="text-[11px] text-cyan-500/50">Redeem your shadow coins</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-sm text-amber-400">{coins}</span>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-cyan-500/40 text-sm">No items available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>{item.title}</span>
                  <span className="font-mono text-amber-400 text-sm">{item.cost} coins</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="hologram"
                  size="sm"
                  className="w-full"
                  disabled={coins < item.cost}
                  onClick={() => void buy(item.id)}
                >
                  {coins < item.cost ? `Need ${item.cost - coins} more` : "Redeem"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Rank Perks</CardTitle>
        </CardHeader>
        <CardContent>
          <RankPerksPanel />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monarch Skill Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <MonarchSkillTree />
        </CardContent>
      </Card>
    </div>
  );
}
