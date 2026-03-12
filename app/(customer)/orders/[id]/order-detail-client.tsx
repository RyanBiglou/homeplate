"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { formatPrice } from "@/lib/validations";
import {
  MapPin,
  Shield,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  CircleCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ComplaintForm } from "@/components/complaint/ComplaintForm";
import { ReviewForm } from "@/components/order/ReviewForm";

interface OrderInfo {
  id: string;
  status: string;
  totalAmount: number;
  platformFee: number | null;
  cookPayout: number | null;
  fulfillmentType: string | null;
  customerNotes: string | null;
  pickupTime: string | null;
  createdAt: string | null;
  cookId: string;
}

interface OrderItemInfo {
  id: string;
  itemName: string | null;
  quantity: number;
  unitPrice: number;
}

interface Props {
  order: OrderInfo;
  orderItems: OrderItemInfo[];
  cookName: string;
  cookCounty: string | null;
  cookPermitNumber: string;
  existingReview?: { rating: number; comment: string | null } | null;
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "ready", label: "Ready", icon: Package },
  { key: "completed", label: "Completed", icon: CircleCheck },
];

export function OrderDetailClient({
  order,
  orderItems,
  cookName,
  cookCounty,
  cookPermitNumber,
  existingReview,
}: Props) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const isCancelled = order.status === "cancelled";
  const canCancel = order.status === "pending";
  const canRevealAddress = ["confirmed", "ready", "completed"].includes(
    order.status
  );

  const currentStepIdx = STATUS_STEPS.findIndex(
    (s) => s.key === order.status
  );

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        toast.success("Order cancelled");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to cancel");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCancelling(false);
    }
  }

  async function handleRevealAddress() {
    setLoadingAddress(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/address`);
      if (res.ok) {
        const data = await res.json();
        setAddress(data.address);
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Cannot reveal address");
      }
    } catch {
      toast.error("Failed to get address");
    } finally {
      setLoadingAddress(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/orders"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-homeplate-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        My Orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-homeplate-dark">
            Order from {cookName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : ""}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div className="mt-6 overflow-hidden rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isCurrent
                          ? "bg-homeplate-orange text-white"
                          : isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`mt-1 text-xs ${
                        isActive ? "font-medium text-homeplate-dark" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        i < currentStepIdx ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          This order has been cancelled.
        </div>
      )}

      {/* Order items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-homeplate-cream text-xs font-medium">
                  {item.quantity}
                </span>
                <span className="text-sm">{item.itemName ?? "Menu Item"}</span>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-homeplate-orange">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Fulfillment details */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fulfillment</span>
            <span className="capitalize">{order.fulfillmentType ?? "Pickup"}</span>
          </div>
          {order.pickupTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requested time</span>
              <span>{order.pickupTime}</span>
            </div>
          )}
          {order.customerNotes && (
            <div>
              <span className="text-muted-foreground">Notes:</span>
              <p className="mt-1 text-gray-700">{order.customerNotes}</p>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700">
              MEHKO Permit: {cookPermitNumber}
            </span>
            {cookCounty && (
              <Badge variant="outline" className="text-xs">
                {cookCounty}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address reveal — LEGAL: only after confirmed payment */}
      {canRevealAddress && order.fulfillmentType === "pickup" && (
        <Card className="mt-4">
          <CardContent className="p-4">
            {address ? (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-homeplate-orange" />
                <div>
                  <p className="text-sm font-medium">Pickup Address</p>
                  <p className="mt-1 text-sm text-gray-600">{address}</p>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRevealAddress}
                disabled={loadingAddress}
              >
                {loadingAddress ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                Show Pickup Address
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {canCancel && (
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Cancel Order
          </Button>
        )}
        <Link href={`/cooks/${order.cookId}`}>
          <Button variant="outline">View Cook Profile</Button>
        </Link>
      </div>

      {/* Review form — available for completed orders */}
      {order.status === "completed" && (
        <div className="mt-8">
          <ReviewForm
            orderId={order.id}
            cookId={order.cookId}
            cookName={cookName}
            existingReview={existingReview}
          />
        </div>
      )}

      {/* Complaint form — available for completed or ready orders */}
      {["confirmed", "ready", "completed"].includes(order.status) && (
        <div className="mt-8">
          <ComplaintForm orderId={order.id} cookId={order.cookId} />
        </div>
      )}

      {/* Legal notice */}
      <p className="mt-6 text-center text-xs italic text-muted-foreground">
        Made in a Home Kitchen — MEHKO permitted operation
      </p>
    </main>
  );
}
