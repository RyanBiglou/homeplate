"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Lock } from "lucide-react";

interface AddressRevealProps {
  orderId: string;
}

export function AddressReveal({ orderId }: AddressRevealProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReveal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/address`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setAddress(data.address);
    } catch {
      setError("Failed to load address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4" />
          Pickup Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        {address ? (
          <p className="font-medium">{address}</p>
        ) : (
          <div className="text-center">
            <Lock className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-muted-foreground">
              Address is revealed after payment for your safety and the
              cook&apos;s privacy.
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <Button
              onClick={handleReveal}
              disabled={loading}
              className="mt-3 bg-homeplate-orange hover:bg-homeplate-orange-dark"
            >
              {loading ? "Loading..." : "Show Address"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
