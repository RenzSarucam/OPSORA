"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert as AlertBox, AlertDescription } from "@/components/ui/alert";
import { fetchAlerts, resolveAlert } from "@/lib/api";
import { cn, extractErrorMessage, formatRelativeTime } from "@/lib/utils";
import type { Alert } from "@/types/alert";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchAlerts()
      .then((data) => {
        setAlerts(data);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err, "Unable to load alerts.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleResolve(alert: Alert) {
    setResolvingId(alert.id);
    try {
      const updated = await resolveAlert(alert.id);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast.success(`Alert for ${alert.project.name} resolved.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to resolve alert."));
    } finally {
      setResolvingId(null);
    }
  }

  const activeCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">
          {isLoading ? "—" : `${activeCount} active alert${activeCount === 1 ? "" : "s"}`}
        </p>
      </div>

      {error && (
        <AlertBox variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </AlertBox>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-sm text-muted-foreground">
              No alerts. Everything&apos;s running smoothly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={cn(alert.status === "resolved" && "opacity-60")}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Link
                      href={`/projects/${alert.project.id}`}
                      className="font-medium hover:underline"
                    >
                      {alert.project.name}
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.status === "resolved"
                      ? `Resolved ${formatRelativeTime(alert.resolved_at)}`
                      : `Detected ${formatRelativeTime(alert.created_at)}`}
                  </p>
                </div>
                {alert.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(alert)}
                    disabled={resolvingId === alert.id}
                  >
                    {resolvingId === alert.id ? "Resolving…" : "Resolve"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}