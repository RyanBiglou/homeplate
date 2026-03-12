"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
      <h2 className="mt-4 text-lg font-bold text-homeplate-dark">
        Admin Panel Error
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Failed to load admin data. Ensure you have the correct permissions.
      </p>
      <Button onClick={reset} className="mt-4" variant="outline">
        Retry
      </Button>
    </div>
  );
}
