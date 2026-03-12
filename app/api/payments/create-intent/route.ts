import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await request.json();

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing orderId" },
      { status: 400 }
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select()
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  if (order.stripe_payment_intent_id) {
    return NextResponse.json({
      clientSecret: null,
      message: "Payment already initiated",
    });
  }

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", order.cook_id)
    .single();

  if (!cookProfile?.user_id) {
    return NextResponse.json(
      { error: "Cook profile not found" },
      { status: 400 }
    );
  }

  const { data: cookUser } = await supabase
    .from("users")
    .select()
    .eq("id", cookProfile.user_id)
    .single();

  if (!cookUser?.stripe_account_id) {
    return NextResponse.json(
      { error: "Cook has not completed Stripe setup" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const platformFee = order.platform_fee ?? Math.round(order.total_amount * 0.1);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total_amount,
      currency: "usd",
      application_fee_amount: platformFee,
      transfer_data: {
        destination: cookUser.stripe_account_id,
      },
      metadata: {
        order_id: order.id,
        cook_id: order.cook_id,
        customer_id: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await supabase
      .from("orders")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
