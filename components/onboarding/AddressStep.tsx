"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface AddressStepProps {
  onNext: (data: { address: string }) => void;
  onBack: () => void;
}

export function AddressStep({ onNext, onBack }: AddressStepProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onNext({ address: form.get("address") as string });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Lock className="mb-1 inline h-4 w-4" /> Your address is kept private
        and only shared with customers after they complete payment.
      </div>
      <div>
        <Label htmlFor="address">Kitchen Address</Label>
        <Input
          id="address"
          name="address"
          required
          placeholder="Full street address"
        />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-homeplate-orange hover:bg-homeplate-orange-dark">
          Continue
        </Button>
      </div>
    </form>
  );
}
