import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <ChefHat className="h-16 w-16 text-gray-300" />
      <h1 className="mt-4 text-4xl font-bold text-homeplate-dark">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        This page doesn&apos;t exist
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you&apos;re looking for may have been moved or removed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button className="bg-homeplate-orange hover:bg-homeplate-orange-dark">
            Go Home
          </Button>
        </Link>
        <Link href="/browse">
          <Button variant="outline">Browse Cooks</Button>
        </Link>
      </div>
    </div>
  );
}
