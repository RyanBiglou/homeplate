import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { OrderDetailClient } from "./order-detail-client";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/orders/" + params.id);

  const { data: order } = await supabase
    .from("orders")
    .select()
    .eq("id", params.id)
    .eq("customer_id", user.id)
    .single();

  if (!order) notFound();

  const { data: orderItems } = await supabase
    .from("order_items")
    .select()
    .eq("order_id", order.id);

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", order.cook_id)
    .single();

  let cookName = "Home Cook";
  if (cookProfile?.user_id) {
    const { data: cookUser } = await supabase
      .from("users")
      .select()
      .eq("id", cookProfile.user_id)
      .single();
    if (cookUser?.name) cookName = cookUser.name;
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select()
    .eq("order_id", order.id)
    .eq("customer_id", user.id)
    .single();

  return (
    <OrderDetailClient
      order={{
        id: order.id,
        status: order.status,
        totalAmount: order.total_amount,
        platformFee: order.platform_fee,
        cookPayout: order.cook_payout,
        fulfillmentType: order.fulfillment_type,
        customerNotes: order.customer_notes,
        pickupTime: order.pickup_time,
        createdAt: order.created_at,
        cookId: order.cook_id,
      }}
      orderItems={(orderItems ?? []).map((item) => ({
        id: item.id,
        itemName: item.item_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      }))}
      cookName={cookName}
      cookCounty={cookProfile?.county ?? null}
      cookPermitNumber={cookProfile?.permit_number ?? ""}
      existingReview={
        existingReview
          ? { rating: existingReview.rating, comment: existingReview.comment }
          : null
      }
    />
  );
}
