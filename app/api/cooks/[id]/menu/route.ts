import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: menu, error } = await supabase
    .from("menus")
    .select("*, menu_items(*)")
    .eq("cook_id", params.id)
    .eq("date", today)
    .eq("active", true)
    .single();

  if (error || !menu) {
    return NextResponse.json({ menu: null });
  }

  return NextResponse.json({ menu });
}
