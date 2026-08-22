import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/types/health";

export type Status = "online" | "warning" | "offline" | "pending" | "inactive";

export function resolveStatus(isActive: boolean, healthStatus: HealthStatus | null | undefined): Status {
  if (!isActive) return "inactive";
  if (!healthStatus) return "pending";
  return healthStatus;
}

const STATUS_CONFIG: Record<Status, { label: string; variant: "success" | "warning" | "danger" | "outline"; dot: string }> = {
  online: { label: "ONLINE", variant: "success", dot: "bg-success" },
  warning: { label: "WARNING", variant: "warning", dot: "bg-warning" },
  offline: { label: "OFFLINE", variant: "danger", dot: "bg-danger" },
  pending: { label: "PENDING", variant: "outline", dot: "bg-muted-foreground" },
  inactive: { label: "INACTIVE", variant: "outline", dot: "bg-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}
