"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders">;

export function useRealtimeOrders(cookProfileId: string, initialOrders: Order[]) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (!cookProfileId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`cook-orders-${cookProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `cook_id=eq.${cookProfileId}`,
        },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `cook_id=eq.${cookProfileId}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.new.id
                ? { ...order, ...(payload.new as Order) }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cookProfileId]);

  return orders;
}
