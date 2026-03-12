"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <h2 className="mt-4 text-xl font-bold text-homeplate-dark">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
        <Button
          onClick={() => (window.location.href = "/")}
          className="bg-homeplate-orange hover:bg-homeplate-orange-dark"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
