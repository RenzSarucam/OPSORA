"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAlerts } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { Alert } from "@/types/alert";

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetchAlerts()
        .then((data) => {
          if (!cancelled) setAlerts(data);
        })
        .catch(() => {
          // Silent: the alerts page itself surfaces load errors — the bell
          // just skips updating rather than interrupting every page.
        });
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const active = alerts.filter((alert) => alert.status === "active");
  const hasCritical = active.some((alert) => alert.severity === "critical");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`${active.length} active alerts`} />
        }
      >
        <span className="relative inline-flex">
          <Bell />
          {active.length > 0 && (
            <span
              className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                hasCritical
                  ? "bg-danger text-danger-foreground"
                  : "bg-warning text-warning-foreground"
              }`}
            >
              {active.length > 9 ? "9+" : active.length}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {active.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No active alerts.
          </div>
        ) : (
          active.slice(0, 5).map((alert) => (
            <DropdownMenuItem
              key={alert.id}
              render={<Link href={`/projects/${alert.project.id}`} />}
              className="flex flex-col items-start gap-1 whitespace-normal"
            >
              <div className="flex items-center gap-2">
                <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <span className="font-medium">{alert.project.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatRelativeTime(alert.created_at)}
              </p>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuItem render={<Link href="/alerts" />} className="justify-center font-medium">
          View all alerts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}