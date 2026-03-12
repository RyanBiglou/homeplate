"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CheckoutForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Stripe Elements checkout coming in Step 9
        </p>
      </CardContent>
    </Card>
  );
}
