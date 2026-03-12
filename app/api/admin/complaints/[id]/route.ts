import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceRoleClient();

  const { data: adminUser } = await serviceClient
    .from("users")
    .select()
    .eq("id", user.id)
    .single();

  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { adminReviewed, reportedToLea } = body;

  const updatePayload: Record<string, boolean | string> = {};
  if (adminReviewed !== undefined) updatePayload.admin_reviewed = adminReviewed;
  if (reportedToLea !== undefined) {
    updatePayload.reported_to_lea = reportedToLea;
    if (reportedToLea) updatePayload.lea_report_date = new Date().toISOString();
  }

  const { data: complaint, error } = await serviceClient
    .from("complaints")
    .update(updatePayload)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ complaint });
}
