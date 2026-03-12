import { createServiceRoleClient } from "@/lib/supabase/server";
import { PermitsManager } from "./permits-manager";

export const metadata = {
  title: "Permit Review — HomePlate Admin",
};

export default async function PermitsPage() {
  const svc = createServiceRoleClient();

  const { data: pendingCooks } = await svc
    .from("cook_profiles")
    .select()
    .order("created_at", { ascending: false });

  const cookList = pendingCooks ?? [];

  const userIds = cookList
    .map((c) => c.user_id)
    .filter(Boolean) as string[];

  const { data: users } = userIds.length > 0
    ? await svc.from("users").select().in("id", userIds)
    : { data: [] };

  const userMap = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u])
  );

  const enriched = cookList.map((cook) => {
    const user = cook.user_id ? userMap[cook.user_id] : null;
    return {
      id: cook.id,
      name: user?.name ?? "Unnamed Cook",
      email: user?.email ?? "",
      permitNumber: cook.permit_number,
      county: cook.county,
      permitVerified: cook.permit_verified,
      active: cook.active,
      createdAt: cook.created_at,
      cuisineTypes: cook.cuisine_types,
    };
  });

  return <PermitsManager cooks={enriched} />;
}
