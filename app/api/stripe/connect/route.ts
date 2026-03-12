import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createConnectAccount, createOnboardingLink } from "@/lib/stripe/connect";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select()
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "cook") {
    return NextResponse.json({ error: "Only cooks can connect Stripe" }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    let stripeAccountId = userData.stripe_account_id;

    if (!stripeAccountId) {
      const account = await createConnectAccount(userData.email);
      stripeAccountId = account.id;

      await supabase
        .from("users")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", user.id);
    }

    const accountLink = await createOnboardingLink(
      stripeAccountId,
      `${appUrl}/api/stripe/connect/return`,
      `${appUrl}/onboarding`
    );

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe Connect error:", err);
    return NextResponse.json(
      { error: "Failed to create Stripe onboarding link" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to initiate Stripe Connect" },
    { status: 405 }
  );
}
