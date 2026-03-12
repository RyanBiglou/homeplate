import { createServiceRoleClient } from "@/lib/supabase/server";
import { ComplaintsManager } from "./complaints-manager";

export const metadata = {
  title: "Complaints — HomePlate Admin",
};

export default async function ComplaintsPage() {
  const svc = createServiceRoleClient();

  const { data: complaints } = await svc
    .from("complaints")
    .select()
    .order("submitted_at", { ascending: false });

  const complaintList = complaints ?? [];

  const cookIds = Array.from(
    new Set(complaintList.map((c) => c.cook_id).filter(Boolean))
  ) as string[];

  const customerIds = Array.from(
    new Set(complaintList.map((c) => c.customer_id).filter(Boolean))
  ) as string[];

  const { data: cookProfiles } = cookIds.length > 0
    ? await svc.from("cook_profiles").select().in("id", cookIds)
    : { data: [] };

  const cookUserIds = (cookProfiles ?? [])
    .map((c) => c.user_id)
    .filter(Boolean) as string[];

  const allUserIds = Array.from(new Set([...cookUserIds, ...customerIds]));

  const { data: users } = allUserIds.length > 0
    ? await svc.from("users").select().in("id", allUserIds)
    : { data: [] };

  const userNameMap = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u.name ?? u.email])
  );

  const cookProfileUserMap = Object.fromEntries(
    (cookProfiles ?? []).map((c) => [c.id, c.user_id])
  );

  const enriched = complaintList.map((c) => ({
    id: c.id,
    description: c.description,
    submittedAt: c.submitted_at,
    adminReviewed: c.admin_reviewed,
    reportedToLea: c.reported_to_lea,
    leaReportDate: c.lea_report_date,
    cookId: c.cook_id,
    cookName: c.cook_id
      ? userNameMap[cookProfileUserMap[c.cook_id] ?? ""] ?? "Unknown Cook"
      : "Unknown Cook",
    customerName: c.customer_id
      ? userNameMap[c.customer_id] ?? "Unknown Customer"
      : "Unknown Customer",
    orderId: c.order_id,
  }));

  return <ComplaintsManager complaints={enriched} />;
}
