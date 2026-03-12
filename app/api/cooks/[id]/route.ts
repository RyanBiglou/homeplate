import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  const { data: cook, error } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", params.id)
    .single();

  if (error || !cook) {
    return NextResponse.json({ error: "Cook not found" }, { status: 404 });
  }

  const { data: user } = cook.user_id
    ? await supabase
        .from("users")
        .select()
        .eq("id", cook.user_id)
        .single()
    : { data: null };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { address, ...safeCook } = cook;

  return NextResponse.json({
    cook: {
      ...safeCook,
      user: user ? { name: user.name, avatar_url: user.avatar_url } : null,
    },
  });
}
