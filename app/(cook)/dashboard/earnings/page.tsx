import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/validations";
import { DollarSign, TrendingUp, ShoppingBag, Calendar } from "lucide-react";

export const metadata = {
  title: "Earnings — HomePlate Cook Dashboard",
};

export default async function EarningsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("user_id", authUser.id)
    .single();

  if (!cookProfile) redirect("/onboarding");

  const { data: allOrders } = await supabase
    .from("orders")
    .select()
    .eq("cook_id", cookProfile.id)
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  const orders = allOrders ?? [];

  const today = new Date().toISOString().split("T")[0];
  const startOfWeek = getStartOfWeek();
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const todayOrders = orders.filter(
    (o) => o.created_at && o.created_at >= `${today}T00:00:00`
  );
  const weekOrders = orders.filter(
    (o) => o.created_at && o.created_at >= startOfWeek
  );
  const monthOrders = orders.filter(
    (o) => o.created_at && o.created_at >= `${startOfMonth}T00:00:00`
  );

  const completedOrders = orders.filter((o) => o.status === "completed");

  const todayEarnings = sumPayout(todayOrders);
  const weekEarnings = sumPayout(weekOrders);
  const monthEarnings = sumPayout(monthOrders);
  const totalEarnings = sumPayout(completedOrders);

  const stats = [
    {
      label: "Today",
      value: todayEarnings,
      orders: todayOrders.length,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "This Week",
      value: weekEarnings,
      orders: weekOrders.length,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "This Month",
      value: monthEarnings,
      orders: monthOrders.length,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "All Time",
      value: totalEarnings,
      orders: completedOrders.length,
      icon: ShoppingBag,
      color: "text-homeplate-orange",
      bg: "bg-orange-50",
    },
  ];

  const recentPayouts = completedOrders.slice(0, 20);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-homeplate-dark">Earnings</h1>
      <p className="text-sm text-muted-foreground">
        Track your revenue and payouts
      </p>

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-homeplate-dark">
                      {formatPrice(stat.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label} • {stat.orders} order
                      {stat.orders !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payout info */}
      <Card className="mt-6">
        <CardContent className="flex items-start gap-3 p-4">
          <DollarSign className="mt-0.5 h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium">Stripe Connect Payouts</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Earnings are deposited directly to your bank account via Stripe
              Connect. HomePlate takes a 10% platform fee. Payouts are processed
              automatically on Stripe&apos;s standard schedule.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent completed orders */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-homeplate-dark">
          Recent Completed Orders
        </h2>
        {recentPayouts.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No completed orders yet. Orders show here once completed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 space-y-2">
            {recentPayouts.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      +{formatPrice(order.cook_payout ?? order.total_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function sumPayout(
  orders: Array<{ cook_payout: number | null; total_amount: number }>
): number {
  return orders.reduce(
    (sum, o) => sum + (o.cook_payout ?? Math.round(o.total_amount * 0.9)),
    0
  );
}
