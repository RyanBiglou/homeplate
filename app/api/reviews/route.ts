import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, cookId, rating, comment } = body;

  if (!orderId || !cookId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Invalid review data. Rating must be 1-5." },
      { status: 400 }
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select()
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "Order not found or does not belong to you" },
      { status: 404 }
    );
  }

  if (order.status !== "completed") {
    return NextResponse.json(
      { error: "Can only review completed orders" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select()
    .eq("order_id", orderId)
    .eq("customer_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this order" },
      { status: 409 }
    );
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      order_id: orderId,
      cook_id: cookId,
      customer_id: user.id,
      rating,
      comment: comment?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}
