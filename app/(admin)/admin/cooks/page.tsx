import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, XCircle, MapPin } from "lucide-react";

export const metadata = {
  title: "Manage Cooks — HomePlate Admin",
};

export default async function ManageCooksPage() {
  const svc = createServiceRoleClient();

  const { data: cooks } = await svc
    .from("cook_profiles")
    .select()
    .order("created_at", { ascending: false });

  const cookList = cooks ?? [];

  const userIds = cookList
    .map((c) => c.user_id)
    .filter(Boolean) as string[];

  const { data: users } = userIds.length > 0
    ? await svc.from("users").select().in("id", userIds)
    : { data: [] };

  const userMap = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u])
  );

  const { data: complaintCounts } = await svc
    .from("complaints")
    .select("cook_id");

  const countByCook: Record<string, number> = {};
  (complaintCounts ?? []).forEach((c) => {
    if (c.cook_id) {
      countByCook[c.cook_id] = (countByCook[c.cook_id] ?? 0) + 1;
    }
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-homeplate-dark">All Cooks</h1>
      <p className="text-sm text-muted-foreground">
        {cookList.length} registered cook{cookList.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 space-y-3">
        {cookList.map((cook) => {
          const user = cook.user_id ? userMap[cook.user_id] : null;
          const complaints = countByCook[cook.id] ?? 0;

          return (
            <Card key={cook.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-homeplate-cream text-lg">
                  🍳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-homeplate-dark">
                      {user?.name ?? "Unnamed Cook"}
                    </span>
                    <Badge
                      variant={cook.permit_verified ? "secondary" : "outline"}
                      className={`text-xs ${
                        cook.permit_verified
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {cook.permit_verified ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <Shield className="mr-1 h-3 w-3" />
                      )}
                      {cook.permit_verified ? "Verified" : "Pending"}
                    </Badge>
                    {!cook.active && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Permit: {cook.permit_number}</span>
                    {cook.county && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cook.county}
                      </span>
                    )}
                    <span>{user?.email ?? ""}</span>
                    {cook.cuisine_types.length > 0 && (
                      <span>{cook.cuisine_types.join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  {complaints > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {complaints} complaint{complaints !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    {user?.stripe_onboarding_complete ? "Stripe ✓" : "No Stripe"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
