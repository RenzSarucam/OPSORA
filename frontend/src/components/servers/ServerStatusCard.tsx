import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Server } from "@/types/server";

export function ServerStatusCard({
  server,
  actions,
}: {
  server: Server;
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{server.name}</p>
          <p className="truncate text-sm text-muted-foreground">{server.host}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant={server.is_active ? "success" : "outline"} className="gap-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full",
                server.is_active ? "bg-success" : "bg-muted-foreground"
              )}
            />
            {server.is_active ? "ACTIVE" : "INACTIVE"}
          </Badge>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{server.environment}</p>
        {server.metrics.available ? (
          <div className="space-y-1.5 text-sm">
            <MetricRow label="CPU" value={server.metrics.cpu} />
            <MetricRow label="Memory" value={server.metrics.memory} />
            <MetricRow label="Disk" value={server.metrics.disk} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Metrics unavailable</p>
        )}
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value != null ? `${value}%` : "—"}</span>
    </div>
  );
}