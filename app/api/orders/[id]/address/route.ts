import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canRevealAddress } from "@/lib/address-guard";

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

  const { data: order } = await supabase
    .from("orders")
    .select()
    .eq("id", params.id)
    .single();

  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = await canRevealAddress(supabase, user.id, order.cook_id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Address can only be revealed after payment" },
      { status: 403 }
    );
  }

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", order.cook_id)
    .single();

  if (!cookProfile) {
    return NextResponse.json({ error: "Cook not found" }, { status: 404 });
  }

  return NextResponse.json({
    address: cookProfile.address,
    lat: cookProfile.lat,
    lng: cookProfile.lng,
  });
}
