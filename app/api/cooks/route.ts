import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const county = searchParams.get("county");
  const cuisine = searchParams.get("cuisine");

  let query = supabase
    .from("cook_profiles")
    .select()
    .eq("active", true)
    .eq("permit_verified", true);

  if (county && county !== "all") {
    query = query.eq("county", county);
  }
  if (cuisine && cuisine !== "all") {
    query = query.contains("cuisine_types", [cuisine]);
  }

  const { data: cooks, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const safeCooks = (cooks ?? []).map(({ address, ...rest }) => rest);

  const cookUserIds = safeCooks
    .map((c) => c.user_id)
    .filter((id): id is string => id !== null);

  let userNames: Record<string, string | null> = {};
  if (cookUserIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select()
      .in("id", cookUserIds);
    userNames = Object.fromEntries(
      (users ?? []).map((u) => [u.id, u.name])
    );
  }

  const enriched = safeCooks.map((cook) => ({
    ...cook,
    name: cook.user_id ? userNames[cook.user_id] ?? "Home Cook" : "Home Cook",
  }));

  return NextResponse.json({ cooks: enriched });
}
