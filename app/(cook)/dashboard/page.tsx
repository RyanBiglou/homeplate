import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed,
  DollarSign,
  ClipboardList,
  TrendingUp,
  ChefHat,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/validations";

export const metadata = {
  title: "Cook Dashboard — HomePlate",
};

export default async function CookDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("user_id", user.id)
    .single();

  if (!cookProfile) redirect("/onboarding");

  const today = new Date().toISOString().split("T")[0];
  const startOfWeek = getStartOfWeek();

  const [todayOrdersRes, weekOrdersRes, todayMenuRes] = await Promise.all([
    supabase
      .from("orders")
      .select()
      .eq("cook_id", cookProfile.id)
      .gte("created_at", `${today}T00:00:00`)
      .not("status", "eq", "cancelled"),
    supabase
      .from("orders")
      .select()
      .eq("cook_id", cookProfile.id)
      .gte("created_at", startOfWeek)
      .not("status", "eq", "cancelled"),
    supabase
      .from("menus")
      .select()
      .eq("cook_id", cookProfile.id)
      .eq("date", today)
      .single(),
  ]);

  const todayOrders = todayOrdersRes.data ?? [];
  const weekOrders = weekOrdersRes.data ?? [];
  const todayMenu = todayMenuRes.data;

  const todayRevenue = todayOrders.reduce((s, o) => s + (o.cook_payout ?? 0), 0);
  const weekRevenue = weekOrders.reduce((s, o) => s + (o.cook_payout ?? 0), 0);
  const todayMeals = todayOrders.length;
  const weekMeals = weekOrders.length;

  const pendingOrders = todayOrders.filter((o) => o.status === "pending" || o.status === "confirmed");

  const dailyPct = Math.round((todayMeals / 30) * 100);
  const weeklyPct = Math.round((weekMeals / 90) * 100);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-homeplate-dark">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Chef</p>
        </div>
        {!cookProfile.permit_verified && (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Permit Pending Review
          </Badge>
        )}
      </div>

      {/* Meal counter banner */}
      <div className="mt-6 rounded-lg bg-homeplate-cream p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Today&apos;s Meals</p>
            <p className="text-3xl font-bold text-homeplate-dark">
              {todayMeals} <span className="text-lg text-gray-400">/ 30</span>
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-homeplate-orange transition-all"
                style={{ width: `${Math.min(dailyPct, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">This Week</p>
            <p className="text-3xl font-bold text-homeplate-dark">
              {weekMeals} <span className="text-lg text-gray-400">/ 90</span>
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-homeplate-orange transition-all"
                style={{ width: `${Math.min(weeklyPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          MEHKO legal limit: 30 meals/day, 90 meals/week
        </p>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Today's Orders", icon: ClipboardList, value: String(todayOrders.length) },
          { title: "Today's Revenue", icon: DollarSign, value: formatPrice(todayRevenue) },
          { title: "Meals Sold Today", icon: UtensilsCrossed, value: String(todayMeals) },
          { title: "Week Revenue", icon: TrendingUp, value: formatPrice(weekRevenue) },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-homeplate-muted" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href={`/dashboard/menu/${today}`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-homeplate-cream">
                  <ChefHat className="h-5 w-5 text-homeplate-orange" />
                </div>
                <div>
                  <p className="font-semibold text-homeplate-dark">
                    {todayMenu ? "Edit Today's Menu" : "Create Today's Menu"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {todayMenu
                      ? `${todayMenu.meals_remaining} meals remaining`
                      : "Set up your dishes for today"}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/orders">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-homeplate-cream">
                  <ClipboardList className="h-5 w-5 text-homeplate-orange" />
                </div>
                <div>
                  <p className="font-semibold text-homeplate-dark">View Orders</p>
                  <p className="text-sm text-gray-500">
                    {pendingOrders.length > 0
                      ? `${pendingOrders.length} orders need attention`
                      : "No pending orders"}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {todayOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet today. Make sure your menu is published!
            </p>
          ) : (
            todayOrders.slice(0, 5).map((order) => (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.fulfillment_type} · {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      order.status === "pending"
                        ? "default"
                        : order.status === "confirmed"
                          ? "secondary"
                          : order.status === "ready"
                            ? "default"
                            : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
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
