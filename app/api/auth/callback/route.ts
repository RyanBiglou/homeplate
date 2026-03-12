import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const role = searchParams.get("role") ?? "customer";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingUser } = await supabase
          .from("users")
          .select()
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          const name =
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "User";

          await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            name,
            role: role === "cook" ? "cook" : "customer",
            avatar_url: user.user_metadata?.avatar_url ?? null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
