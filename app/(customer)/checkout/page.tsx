"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/validations";
import { Loader2, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cookId, menuId, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [cookName, setCookName] = useState<string>("");
  const [fulfillmentType, setFulfillmentType] = useState("pickup");
  const [customerNotes, setCustomerNotes] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const total = totalPrice();
  const platformFee = Math.round(total * 0.1);
  const cookPayout = total - platformFee;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) {
        router.push("/login?redirect=/checkout");
        return;
      }
      setUser(u);
    });
  }, [router]);

  useEffect(() => {
    if (!cookId) return;
    fetch(`/api/cooks/${cookId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.cook?.user?.name) setCookName(data.cook.user.name);
      })
      .catch(() => {});
  }, [cookId]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-homeplate-dark">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add some meals before checking out.
        </p>
        <Button
          className="mt-6"
          onClick={() => router.push("/browse")}
        >
          Browse Cooks
        </Button>
      </main>
    );
  }

  async function handlePlaceOrder() {
    if (!user || !cookId || !menuId) return;
    setLoading(true);
    setError(null);

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId,
          menuId,
          fulfillmentType,
          customerNotes: customerNotes.trim() || null,
          pickupTime: pickupTime || null,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error ?? "Failed to create order");
        setLoading(false);
        return;
      }

      const paymentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        setError(paymentData.error ?? "Failed to create payment");
        setLoading(false);
        return;
      }

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/${orderData.order.id}?payment_status=success`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-homeplate-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-homeplate-dark">Checkout</h1>
      {cookName && (
        <p className="mt-1 text-sm text-muted-foreground">
          Ordering from <span className="font-medium">{cookName}</span>
        </p>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Order items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              key={item.menuItemId}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-homeplate-cream text-xs font-medium">
                  {item.quantity}
                </span>
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee (10%)</span>
            <span>{formatPrice(platformFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-homeplate-orange">{formatPrice(total)}</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Cook receives {formatPrice(cookPayout)} directly via Stripe
          </p>
        </CardContent>
      </Card>

      {/* Fulfillment */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Fulfillment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={fulfillmentType}
            onValueChange={setFulfillmentType}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Pickup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery">Delivery</Label>
            </div>
          </RadioGroup>

          <div>
            <Label htmlFor="pickupTime" className="text-sm">
              Preferred {fulfillmentType === "pickup" ? "pickup" : "delivery"} time
            </Label>
            <input
              id="pickupTime"
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-homeplate-orange focus:outline-none focus:ring-1 focus:ring-homeplate-orange"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm">
              Notes for the cook (optional)
            </Label>
            <Textarea
              id="notes"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Allergies, special requests..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal notice */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-700">
        <Shield className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <strong>MEHKO Notice:</strong> This meal is prepared in a home kitchen
          that is permitted by the county health department. Payments go directly
          to the cook. No third-party delivery is used.
        </div>
      </div>

      {/* Place order */}
      <Button
        className="mt-6 w-full bg-homeplate-orange py-6 text-lg hover:bg-homeplate-orange-dark"
        onClick={handlePlaceOrder}
        disabled={loading || !user}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Placing Order...
          </>
        ) : (
          `Place Order • ${formatPrice(total)}`
        )}
      </Button>
    </main>
  );
}
