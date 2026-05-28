"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import { useDashboard } from "@/hooks/useDashboard";

interface ShopItem {
  id: string;
  title: string;
  cost: number;
}

export default function ShadowShopPage() {
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
    <div className="p-8 space-y-8 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">Shadow Shop</h1>
        <p className="text-cyan-500/50 mt-1 font-mono">{coins} Shadow Coins</p>
      </header>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between">
                {item.title}
                <span className="font-mono text-amber-400">{item.cost} coins</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="hologram"
                size="sm"
                disabled={coins < item.cost}
                onClick={() => void buy(item.id)}
              >
                Redeem
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
