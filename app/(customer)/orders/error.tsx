"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Orders error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
      <h2 className="mt-4 text-lg font-bold text-homeplate-dark">
        Failed to Load Orders
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong loading your orders.
      </p>
      <Button onClick={reset} className="mt-4" variant="outline">
        Retry
      </Button>
    </div>
  );
}
