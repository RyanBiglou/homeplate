import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select()
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.customer_id !== user.id) {
    const { data: cookProfile } = await supabase
      .from("cook_profiles")
      .select()
      .eq("id", order.cook_id)
      .single();

    if (!cookProfile || cookProfile.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select()
    .eq("order_id", order.id);

  return NextResponse.json({ order: { ...order, order_items: orderItems ?? [] } });
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  ready: ["completed"],
};

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

  const body = await request.json();
  const { status: newStatus } = body;

  const { data: existingOrder } = await supabase
    .from("orders")
    .select()
    .eq("id", params.id)
    .single();

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", existingOrder.cook_id)
    .single();

  const isCook = cookProfile?.user_id === user.id;
  const isCustomer = existingOrder.customer_id === user.id;

  if (!isCook && !isCustomer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isCustomer && newStatus !== "cancelled") {
    return NextResponse.json(
      { error: "Customers can only cancel orders" },
      { status: 403 }
    );
  }

  const allowed = VALID_TRANSITIONS[existingOrder.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${existingOrder.status} to ${newStatus}` },
      { status: 400 }
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order });
}
