import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkMealLimits } from "@/lib/meal-limits";

interface OrderItemInput {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    cookId,
    menuId,
    fulfillmentType,
    customerNotes,
    pickupTime,
    items,
  } = body as {
    cookId: string;
    menuId: string;
    fulfillmentType: string;
    customerNotes: string | null;
    pickupTime: string | null;
    items: OrderItemInput[];
  };

  if (!cookId || !menuId || !items || items.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const totalMeals = items.reduce((sum, item) => sum + item.quantity, 0);

  const mealCheck = await checkMealLimits(supabase, cookId, totalMeals);
  if (!mealCheck.allowed) {
    return NextResponse.json({ error: mealCheck.reason }, { status: 400 });
  }

  const { data: menu } = await supabase
    .from("menus")
    .select()
    .eq("id", menuId)
    .eq("cook_id", cookId)
    .eq("active", true)
    .single();

  if (!menu) {
    return NextResponse.json(
      { error: "Menu is no longer available" },
      { status: 400 }
    );
  }

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", cookId)
    .single();

  if (!cookProfile || !cookProfile.permit_verified) {
    return NextResponse.json(
      { error: "Cook is not currently verified" },
      { status: 400 }
    );
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const platformFee = Math.round(totalAmount * 0.1);
  const cookPayout = totalAmount - platformFee;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      cook_id: cookId,
      menu_id: menuId,
      status: "pending",
      total_amount: totalAmount,
      platform_fee: platformFee,
      cook_payout: cookPayout,
      fulfillment_type: fulfillmentType ?? "pickup",
      customer_notes: customerNotes,
      pickup_time: pickupTime,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  const orderItems = items.map((item: OrderItemInput) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    item_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Failed to create order items" },
      { status: 500 }
    );
  }

  return NextResponse.json({ order }, { status: 201 });
}
