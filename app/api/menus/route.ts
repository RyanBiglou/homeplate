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
  const { date, availableFrom, availableUntil, notes, fulfillmentTypes } = body;

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("user_id", user.id)
    .single();

  if (!cookProfile) {
    return NextResponse.json({ error: "Cook profile not found" }, { status: 404 });
  }

  const { data: menu, error } = await supabase
    .from("menus")
    .upsert(
      {
        cook_id: cookProfile.id,
        date,
        available_from: availableFrom ?? null,
        available_until: availableUntil ?? null,
        notes: notes ?? null,
        fulfillment_types: fulfillmentTypes ?? ["pickup"],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cook_id,date" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ menu });
}
