import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAccountStatus } from "@/lib/stripe/connect";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const { data: userData } = await supabase
    .from("users")
    .select()
    .eq("id", user.id)
    .single();

  if (userData?.stripe_account_id) {
    try {
      const status = await getAccountStatus(userData.stripe_account_id);

      if (status.detailsSubmitted) {
        await supabase
          .from("users")
          .update({ stripe_onboarding_complete: true })
          .eq("id", user.id);

        return NextResponse.redirect(`${appUrl}/dashboard`);
      }
    } catch (err) {
      console.error("Error checking Stripe status:", err);
    }
  }

  return NextResponse.redirect(`${appUrl}/onboarding`);
}
