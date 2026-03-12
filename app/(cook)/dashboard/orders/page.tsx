import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CookOrdersFeed } from "./feed";

export const metadata = {
  title: "Orders — HomePlate Cook Dashboard",
};

export default async function CookOrdersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("user_id", user.id)
    .single();

  if (!cookProfile) redirect("/onboarding");

  const today = new Date().toISOString().split("T")[0];

  const { data: orders } = await supabase
    .from("orders")
    .select()
    .eq("cook_id", cookProfile.id)
    .gte("created_at", `${today}T00:00:00`)
    .order("created_at", { ascending: false });

  const orderIds = (orders ?? []).map((o) => o.id);

  let orderItems: Array<{
    id: string;
    order_id: string;
    item_name: string | null;
    quantity: number;
    unit_price: number;
  }> = [];

  if (orderIds.length > 0) {
    const { data } = await supabase
      .from("order_items")
      .select()
      .in("order_id", orderIds);
    orderItems = (data ?? []).map((i) => ({
      id: i.id,
      order_id: i.order_id,
      item_name: i.item_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));
  }

  const customerIds = Array.from(new Set((orders ?? []).map((o) => o.customer_id)));
  let customers: Array<{ id: string; name: string | null }> = [];
  if (customerIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select()
      .in("id", customerIds);
    customers = (data ?? []).map((u) => ({ id: u.id, name: u.name }));
  }

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.name]));
  const itemsByOrder = new Map<string, typeof orderItems>();
  for (const item of orderItems) {
    const existing = itemsByOrder.get(item.order_id) ?? [];
    existing.push(item);
    itemsByOrder.set(item.order_id, existing);
  }

  const enrichedOrders = (orders ?? []).map((o) => ({
    ...o,
    customerName: customerMap[o.customer_id] ?? null,
    items: itemsByOrder.get(o.id) ?? [],
  }));

  return (
    <CookOrdersFeed
      cookProfileId={cookProfile.id}
      initialOrders={enrichedOrders}
    />
  );
}
