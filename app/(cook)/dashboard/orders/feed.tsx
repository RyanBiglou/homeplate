"use client";

import { useState } from "react";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { OrderCard } from "@/components/order/OrderCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"orders">;

interface EnrichedOrder extends Order {
  customerName: string | null;
  items: Array<{
    id: string;
    order_id: string;
    item_name: string | null;
    quantity: number;
    unit_price: number;
  }>;
}

interface CookOrdersFeedProps {
  cookProfileId: string;
  initialOrders: EnrichedOrder[];
}

export function CookOrdersFeed({
  cookProfileId,
  initialOrders,
}: CookOrdersFeedProps) {
  const [filter, setFilter] = useState("active");
  const [refreshing, setRefreshing] = useState(false);

  const rawOrders = useRealtimeOrders(cookProfileId, initialOrders);

  const enrichedMap = new Map(initialOrders.map((o) => [o.id, o]));
  const orders: EnrichedOrder[] = rawOrders.map((o) => {
    const enriched = enrichedMap.get(o.id);
    return {
      ...o,
      customerName: enriched?.customerName ?? null,
      items: enriched?.items ?? [],
    };
  });

  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "ready"
  );
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const filteredOrders =
    filter === "active"
      ? activeOrders
      : filter === "completed"
        ? completedOrders
        : cancelledOrders;

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Failed to update order");
        return;
      }

      toast.success(
        newStatus === "confirmed"
          ? "Order confirmed!"
          : newStatus === "ready"
            ? "Order marked as ready"
            : newStatus === "completed"
              ? "Order completed"
              : newStatus === "cancelled"
                ? "Order cancelled"
                : "Order updated"
      );
    } catch {
      toast.error("Failed to update order");
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    window.location.reload();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-homeplate-dark">Live Orders</h1>
          <p className="text-gray-600">Real-time incoming orders</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
              <Bell className="h-4 w-4" />
              {pendingCount} new
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-green-50 p-2 text-center text-xs text-green-700">
        <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
        Live — new orders appear automatically
      </div>

      <Tabs
        value={filter}
        onValueChange={setFilter}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {filter === "active"
                  ? "No active orders right now. New orders will appear here in real-time."
                  : filter === "completed"
                    ? "No completed orders today."
                    : "No cancelled orders today."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                status={order.status}
                totalAmount={order.total_amount}
                platformFee={order.platform_fee}
                cookPayout={order.cook_payout}
                fulfillmentType={order.fulfillment_type}
                createdAt={order.created_at}
                customerNotes={order.customer_notes}
                customerName={order.customerName}
                items={order.items}
                isCookView={true}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
