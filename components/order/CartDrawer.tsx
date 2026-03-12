"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, type CartItem } from "@/hooks/useCart";
import { formatPrice } from "@/lib/validations";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    setOpen,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const count = totalItems();
  const total = totalPrice();

  function handleCheckout() {
    setOpen(false);
    router.push("/checkout");
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({count} {count === 1 ? "item" : "items"})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                router.push("/browse");
              }}
            >
              Browse Cooks
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItemRow
                    key={item.menuItemId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Payments go directly to the cook via Stripe
              </p>

              <Separator className="my-3" />

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  className="w-full bg-homeplate-orange hover:bg-homeplate-orange-dark"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-700"
                  onClick={clearCart}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Clear Cart
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-homeplate-dark">
          {item.name}
        </p>
        <p className="text-sm text-homeplate-orange">
          {formatPrice(item.price)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="w-16 text-right text-sm font-semibold">
        {formatPrice(item.price * item.quantity)}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-red-400 hover:text-red-600"
        onClick={() => onRemove(item.menuItemId)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
