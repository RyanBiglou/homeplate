"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatPrice } from "@/lib/validations";
import {
  CheckCircle2,
  Package,
  CircleCheck,
  XCircle,
  Loader2,
  User,
  Clock,
} from "lucide-react";
import { useState } from "react";

interface OrderCardProps {
  id: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  cookPayout: number | null;
  fulfillmentType: string;
  createdAt: string;
  customerNotes: string | null;
  customerName?: string | null;
  items?: Array<{
    id: string;
    item_name: string | null;
    quantity: number;
    unit_price: number;
  }>;
  isCookView?: boolean;
  onStatusUpdate?: (orderId: string, newStatus: string) => Promise<void>;
}

const STATUS_FLOW: Record<string, { next: string; label: string; icon: React.ElementType }> = {
  pending: { next: "confirmed", label: "Confirm Order", icon: CheckCircle2 },
  confirmed: { next: "ready", label: "Mark Ready", icon: Package },
  ready: { next: "completed", label: "Complete", icon: CircleCheck },
};

export function OrderCard({
  id,
  status,
  totalAmount,
  cookPayout,
  fulfillmentType,
  createdAt,
  customerNotes,
  customerName,
  items,
  isCookView = false,
  onStatusUpdate,
}: OrderCardProps) {
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const nextAction = STATUS_FLOW[status];
  const canCancel = status === "pending" || status === "confirmed";

  async function handleStatusUpdate(newStatus: string) {
    if (!onStatusUpdate) return;
    setUpdating(true);
    await onStatusUpdate(id, newStatus);
    setUpdating(false);
  }

  async function handleCancel() {
    if (!onStatusUpdate) return;
    setCancelling(true);
    await onStatusUpdate(id, "cancelled");
    setCancelling(false);
  }

  const timeAgo = getTimeAgo(createdAt);

  return (
    <Card
      className={
        status === "pending"
          ? "border-yellow-300 bg-yellow-50/50"
          : status === "confirmed"
            ? "border-blue-200"
            : ""
      }
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                #{id.slice(0, 8)}
              </span>
              <OrderStatusBadge status={status} size="sm" />
              <span className="text-xs text-gray-400">
                <Clock className="mr-0.5 inline h-3 w-3" />
                {timeAgo}
              </span>
            </div>

            {customerName && (
              <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {customerName}
              </p>
            )}

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-homeplate-dark">
                {formatPrice(totalAmount)}
              </span>
              {cookPayout !== null && cookPayout > 0 && (
                <span className="text-sm text-green-600">
                  (you earn {formatPrice(cookPayout)})
                </span>
              )}
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {fulfillmentType}
              </span>
            </div>

            {items && items.length > 0 && (
              <div className="mt-2 space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.quantity}× {item.item_name ?? "Item"}{" "}
                    <span className="text-gray-400">
                      {formatPrice(item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {customerNotes && (
              <div className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-700">
                <strong>Note:</strong> {customerNotes}
              </div>
            )}
          </div>
        </div>

        {isCookView && (nextAction || canCancel) && status !== "completed" && status !== "cancelled" && (
          <div className="mt-3 flex gap-2">
            {nextAction && (
              <Button
                size="sm"
                className="flex-1 bg-homeplate-orange hover:bg-homeplate-orange/90"
                onClick={() => handleStatusUpdate(nextAction.next)}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <nextAction.icon className="mr-1 h-4 w-4" />
                )}
                {nextAction.label}
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-1 h-4 w-4" />
                )}
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}
