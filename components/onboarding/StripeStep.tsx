"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, ExternalLink } from "lucide-react";

interface StripeStepProps {
  onConnect: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function StripeStep({ onConnect, onBack, loading }: StripeStepProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-homeplate-cream">
        <DollarSign className="h-8 w-8 text-homeplate-orange" />
      </div>
      <h3 className="text-lg font-semibold">Set Up Payments</h3>
      <p className="text-sm text-muted-foreground">
        Connect your Stripe account to receive payments directly from customers.
        HomePlate never holds your funds — payments go straight to you.
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onConnect}
          disabled={loading}
          className="flex-1 bg-homeplate-orange hover:bg-homeplate-orange-dark"
        >
          {loading ? "Setting up..." : "Connect Stripe"}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
