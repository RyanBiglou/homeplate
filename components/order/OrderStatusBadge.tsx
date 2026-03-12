import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Package, CircleCheck, XCircle } from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
  size?: "sm" | "default";
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle2,
  },
  ready: {
    label: "Ready",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: Package,
  },
  completed: {
    label: "Completed",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    icon: CircleCheck,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

export function OrderStatusBadge({ status, size = "default" }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800",
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === "sm" ? "text-xs" : ""}`}
    >
      <Icon className={`mr-1 ${size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
      {config.label}
    </Badge>
  );
}
