"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SoldOutToggleProps {
  itemId: string;
  soldOut: boolean;
  onToggle: (itemId: string, soldOut: boolean) => void;
}

export function SoldOutToggle({ itemId, soldOut, onToggle }: SoldOutToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`sold-out-${itemId}`}
        checked={soldOut}
        onCheckedChange={(checked) => onToggle(itemId, checked)}
      />
      <Label htmlFor={`sold-out-${itemId}`} className="text-sm">
        {soldOut ? "Sold Out" : "Available"}
      </Label>
    </div>
  );
}
