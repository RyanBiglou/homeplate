import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { formatPrice } from "@/lib/validations";
import { Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Orders — HomePlate",
};

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select()
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const orderList = orders ?? [];

  const cookIds = Array.from(
    new Set(orderList.map((o) => o.cook_id).filter(Boolean))
  );

  const { data: cookProfiles } = cookIds.length > 0
    ? await supabase
        .from("cook_profiles")
        .select()
        .in("id", cookIds)
    : { data: [] };

  const cookProfileMap = Object.fromEntries(
    (cookProfiles ?? []).map((c) => [c.id, c])
  );

  const cookUserIds = (cookProfiles ?? [])
    .map((c) => c.user_id)
    .filter(Boolean) as string[];

  const { data: cookUsers } = cookUserIds.length > 0
    ? await supabase.from("users").select().in("id", cookUserIds)
    : { data: [] };

  const cookNameMap = Object.fromEntries(
    (cookUsers ?? []).map((u) => [u.id, u.name ?? "Home Cook"])
  );

  function getCookName(cookId: string): string {
    const profile = cookProfileMap[cookId];
    if (!profile?.user_id) return "Home Cook";
    return cookNameMap[profile.user_id] ?? "Home Cook";
  }

  function getTimeAgo(dateStr: string | null): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-homeplate-dark">My Orders</h1>
      <p className="text-sm text-muted-foreground">
        {orderList.length} order{orderList.length !== 1 ? "s" : ""}
      </p>

      {orderList.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-muted-foreground">
              No orders yet. Browse cooks to place your first order!
            </p>
            <Link
              href="/browse"
              className="mt-4 inline-block rounded-lg bg-homeplate-orange px-4 py-2 text-sm font-medium text-white hover:bg-homeplate-orange-dark"
            >
              Browse Cooks
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {orderList.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="transition-colors hover:bg-gray-50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-homeplate-dark">
                        {getCookName(order.cook_id)}
                      </p>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatPrice(order.total_amount)}</span>
                      <span>•</span>
                      <span>{order.fulfillment_type ?? "Pickup"}</span>
                      <span>•</span>
                      <span>{getTimeAgo(order.created_at)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
