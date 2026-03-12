"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/validations";

interface MenuItemCardProps {
  id: string;
  menuId: string;
  cookId: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  dietaryTags: string[];
  soldOut: boolean;
  qtyRemaining: number | null;
  onAddToCart?: () => void;
}

export function MenuItemCard({
  name,
  description,
  price,
  photoUrl,
  dietaryTags,
  soldOut,
  qtyRemaining,
  onAddToCart,
}: MenuItemCardProps) {
  return (
    <Card className={soldOut ? "opacity-60" : ""}>
      <CardContent className="flex gap-4 p-4">
        {photoUrl && (
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-homeplate-dark">{name}</h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
            <span className="font-semibold text-homeplate-orange">
              {formatPrice(price)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {dietaryTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {qtyRemaining !== null && qtyRemaining <= 5 && !soldOut && (
              <span className="text-xs text-orange-600">
                Only {qtyRemaining} left
              </span>
            )}
            {soldOut && (
              <Badge variant="destructive" className="text-xs">
                Sold Out
              </Badge>
            )}
          </div>
          {!soldOut && onAddToCart && (
            <Button
              size="sm"
              className="mt-3 bg-homeplate-orange hover:bg-homeplate-orange-dark"
              onClick={onAddToCart}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
