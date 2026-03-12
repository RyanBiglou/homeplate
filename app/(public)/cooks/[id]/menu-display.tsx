"use client";

import { useRealtimeMenu } from "@/hooks/useRealtimeMenu";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Tables } from "@/lib/supabase/types";

type MenuItem = Tables<"menu_items">;

interface CookMenuDisplayProps {
  menuId: string;
  cookId: string;
  initialItems: Array<{
    id: string;
    menu_id: string;
    name: string;
    description: string | null;
    price: number;
    photo_url: string | null;
    dietary_tags: string[];
    available_qty: number | null;
    qty_remaining: number | null;
    sold_out: boolean;
  }>;
  mealsRemaining: number;
  fulfillmentTypes: string[];
}

export function CookMenuDisplay({
  menuId,
  cookId,
  initialItems,
  mealsRemaining,
  fulfillmentTypes,
}: CookMenuDisplayProps) {
  const items = useRealtimeMenu(menuId, initialItems as MenuItem[]);
  const { addItem, toggleCart } = useCart();

  function handleAddToCart(item: MenuItem) {
    if (item.sold_out) {
      toast.error("This item is sold out");
      return;
    }

    addItem({
      menuItemId: item.id,
      menuId,
      cookId,
      name: item.name,
      price: item.price,
    });

    toast.success(`Added "${item.name}" to cart`, {
      action: {
        label: "View Cart",
        onClick: () => toggleCart(),
      },
    });
  }

  const availableItems = items.filter((i) => !i.sold_out);
  const soldOutItems = items.filter((i) => i.sold_out);

  return (
    <div className="mt-4">
      {/* Menu status */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge
          variant={mealsRemaining > 5 ? "secondary" : "destructive"}
          className="text-xs"
        >
          {mealsRemaining} meals remaining today
        </Badge>
        {fulfillmentTypes.map((type) => (
          <Badge key={type} variant="outline" className="text-xs">
            {type === "dine_in"
              ? "Dine-in"
              : type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        ))}
        <span className="text-xs text-gray-400">
          <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live updates
        </span>
      </div>

      {/* Available items */}
      <div className="space-y-3">
        {availableItems.map((item) => (
          <MenuItemCard
            key={item.id}
            id={item.id}
            menuId={item.menu_id}
            cookId={cookId}
            name={item.name}
            description={item.description}
            price={item.price}
            photoUrl={item.photo_url}
            dietaryTags={item.dietary_tags}
            soldOut={item.sold_out}
            qtyRemaining={item.qty_remaining}
            onAddToCart={() => handleAddToCart(item)}
          />
        ))}
      </div>

      {/* Sold out items */}
      {soldOutItems.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-gray-400">Sold Out</p>
          <div className="space-y-3">
            {soldOutItems.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                menuId={item.menu_id}
                cookId={cookId}
                name={item.name}
                description={item.description}
                price={item.price}
                photoUrl={item.photo_url}
                dietaryTags={item.dietary_tags}
                soldOut={true}
                qtyRemaining={item.qty_remaining}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No items on today&apos;s menu yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
