import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantMap: Record<string, StatusVariant> = {
  available: "success",
  confirmed: "success",
  completed: "success",
  registration_open: "success",
  active: "success",
  pending: "warning",
  upcoming: "info",
  in_progress: "info",
  registration_closed: "warning",
  maintenance: "warning",
  blocked: "warning",
  booked: "default",
  cancelled: "error",
  closed: "error",
};

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  default: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || variantMap[status] || "default";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", variantStyles[resolvedVariant], className)}
    >
      {label}
    </Badge>
  );
}
