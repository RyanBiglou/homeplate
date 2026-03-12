import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface CookBadgeProps {
  permitNumber: string;
  verified?: boolean;
}

export function CookBadge({ permitNumber, verified }: CookBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 border-green-300 bg-green-50 text-green-700"
    >
      <Shield className="h-3 w-3" />
      MEHKO Permit: {permitNumber}
      {verified && " ✓"}
    </Badge>
  );
}
