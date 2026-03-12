import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ChefHat,
  ShoppingBag,
  AlertTriangle,
  Shield,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard — HomePlate",
};

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const svc = createServiceRoleClient();

  const [
    { count: totalUsers },
    { count: totalCooks },
    { count: pendingPermits },
    { count: totalOrders },
    { count: openComplaints },
    { count: flaggedComplaints },
  ] = await Promise.all([
    svc.from("users").select("*", { count: "exact", head: true }),
    svc.from("cook_profiles").select("*", { count: "exact", head: true }),
    svc
      .from("cook_profiles")
      .select("*", { count: "exact", head: true })
      .eq("permit_verified", false),
    svc.from("orders").select("*", { count: "exact", head: true }),
    svc
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("admin_reviewed", false),
    svc
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("reported_to_lea", false)
      .eq("admin_reviewed", false),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const { count: todayOrders } = await svc
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${today}T00:00:00`);

  const { data: recentComplaints } = await svc
    .from("complaints")
    .select()
    .eq("admin_reviewed", false)
    .order("submitted_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Registered Cooks",
      value: totalCooks ?? 0,
      icon: ChefHat,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Permits",
      value: pendingPermits ?? 0,
      icon: Shield,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      href: "/admin/permits",
    },
    {
      label: "Total Orders",
      value: totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Today's Orders",
      value: todayOrders ?? 0,
      icon: DollarSign,
      color: "text-homeplate-orange",
      bg: "bg-orange-50",
    },
    {
      label: "Open Complaints",
      value: openComplaints ?? 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/admin/complaints",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-homeplate-dark">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            HomePlate MEHKO Platform Administration
          </p>
        </div>
        {(flaggedComplaints ?? 0) > 0 && (
          <Badge variant="destructive" className="px-3 py-1">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {flaggedComplaints} flagged
          </Badge>
        )}
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <Card
              className={
                stat.href
                  ? "cursor-pointer transition-colors hover:bg-gray-50"
                  : ""
              }
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-homeplate-dark">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/permits">
          <Card className="transition-colors hover:bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-yellow-600" />
                Permit Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {pendingPermits ?? 0} permits awaiting verification
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/complaints">
          <Card className="transition-colors hover:bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {openComplaints ?? 0} complaints need review
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/cooks">
          <Card className="transition-colors hover:bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ChefHat className="h-4 w-4 text-green-600" />
                Manage Cooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {totalCooks ?? 0} registered cooks
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent complaints */}
      {(recentComplaints?.length ?? 0) > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-homeplate-dark">
            Recent Complaints (Unreviewed)
          </h2>
          <div className="mt-3 space-y-2">
            {recentComplaints!.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{c.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cook: {c.cook_id?.slice(0, 8)}... •{" "}
                      {c.submitted_at
                        ? new Date(c.submitted_at).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <Badge variant={c.reported_to_lea ? "destructive" : "outline"} className="text-xs">
                    {c.reported_to_lea ? "LEA Reported" : "Pending"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
