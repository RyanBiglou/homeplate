import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendAdminComplaintAlert } from "@/lib/email/send";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, cookId, description } = body;

  const { data: complaint, error } = await supabase
    .from("complaints")
    .insert({
      order_id: orderId,
      cook_id: cookId,
      customer_id: user.id,
      description,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const twoWeeksAgo = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { count } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true })
    .eq("cook_id", cookId)
    .gte("submitted_at", twoWeeksAgo);

  if (count && count >= 3) {
    sendAdminComplaintAlert(cookId, count).catch(console.error);

    await supabase
      .from("complaints")
      .update({ admin_reviewed: false })
      .eq("cook_id", cookId)
      .gte("submitted_at", twoWeeksAgo);
  }

  return NextResponse.json({ complaint });
}
