import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateListingText } from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { menuId, name, description, price, photoUrl, dietaryTags, availableQty } = body;

  const nameCheck = validateListingText(name);
  if (!nameCheck.valid) {
    return NextResponse.json({ error: nameCheck.reason }, { status: 400 });
  }

  if (description) {
    const descCheck = validateListingText(description);
    if (!descCheck.valid) {
      return NextResponse.json({ error: descCheck.reason }, { status: 400 });
    }
  }

  const { data: item, error } = await supabase
    .from("menu_items")
    .insert({
      menu_id: menuId,
      name,
      description,
      price,
      photo_url: photoUrl,
      dietary_tags: dietaryTags ?? [],
      available_qty: availableQty,
      qty_remaining: availableQty,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item });
}
