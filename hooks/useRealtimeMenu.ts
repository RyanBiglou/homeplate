"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type MenuItem = Tables<"menu_items">;

export function useRealtimeMenu(menuId: string, initialItems: MenuItem[]) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (!menuId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`menu-${menuId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "menu_items",
          filter: `menu_id=eq.${menuId}`,
        },
        (payload) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id
                ? { ...item, ...(payload.new as MenuItem) }
                : item
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "menu_items",
          filter: `menu_id=eq.${menuId}`,
        },
        (payload) => {
          setItems((prev) => [...prev, payload.new as MenuItem]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "menu_items",
          filter: `menu_id=eq.${menuId}`,
        },
        (payload) => {
          setItems((prev) =>
            prev.filter((item) => item.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [menuId]);

  return items;
}
