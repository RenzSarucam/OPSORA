"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchActivity } from "@/lib/api";
import { extractErrorMessage, formatRelativeTime } from "@/lib/utils";
import type { ActivityLog } from "@/types/activity";

const SEVERITY_BY_ACTION: Record<string, "danger" | "warning" | "success" | "outline"> = {
  alert_created: "warning",
  alert_resolved: "success",
  project_deleted: "danger",
  project_disabled: "outline",
};

function formatAction(action: string): string {
  return action.replace(/_/g, " ").toUpperCase();
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchActivity()
      .then((data) => {
        setLogs(data);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err, "Unable to load activity.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">Recent actions across your infrastructure.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <ScrollText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={SEVERITY_BY_ACTION[log.action] ?? "outline"}>
                      {formatAction(log.action)}
                    </Badge>
                    {log.project && (
                      <Link
                        href={`/projects/${log.project.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {log.project.name}
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{log.description}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p>{log.user?.name ?? "System"}</p>
                  <p>{formatRelativeTime(log.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}