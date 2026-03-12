import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DailyMenuBuilder } from "@/components/menu/DailyMenuBuilder";

export default async function MenuDatePage({
  params,
}: {
  params: { date: string };
}) {
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

  const { data: existingMenu } = await supabase
    .from("menus")
    .select()
    .eq("cook_id", cookProfile.id)
    .eq("date", params.date)
    .single();

  let menuItems: Array<{
    id: string;
    menu_id: string;
    name: string;
    description: string | null;
    price: number;
    photo_url: string | null;
    dietary_tags: string[];
    available_qty: number | null;
    qty_remaining: number | null;
    sold_out: boolean;
  }> = [];

  if (existingMenu) {
    const { data } = await supabase
      .from("menu_items")
      .select()
      .eq("menu_id", existingMenu.id)
      .order("created_at", { ascending: true });

    menuItems = (data ?? []).map((item) => ({
      id: item.id,
      menu_id: item.menu_id,
      name: item.name,
      description: item.description,
      price: item.price,
      photo_url: item.photo_url,
      dietary_tags: item.dietary_tags,
      available_qty: item.available_qty,
      qty_remaining: item.qty_remaining,
      sold_out: item.sold_out,
    }));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <DailyMenuBuilder
        date={params.date}
        cookId={cookProfile.id}
        existingMenu={
          existingMenu
            ? {
                id: existingMenu.id,
                active: existingMenu.active,
                mealsRemaining: existingMenu.meals_remaining,
                availableFrom: existingMenu.available_from,
                availableUntil: existingMenu.available_until,
                notes: existingMenu.notes,
                fulfillmentTypes: existingMenu.fulfillment_types,
              }
            : null
        }
        existingItems={menuItems}
      />
    </main>
  );
}
