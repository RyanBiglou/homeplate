import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/webhook";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("status", "pending");
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("status", "pending");
      }
      break;
    }

    case "transfer.created": {
      const transfer = event.data.object as Stripe.Transfer;
      const orderId = transfer.metadata?.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            stripe_transfer_id: transfer.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
