"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectStatusTable } from "@/components/dashboard/ProjectStatusTable";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboard } from "@/lib/api";
import { extractErrorMessage, formatResponseTime } from "@/lib/utils";
import type { Project } from "@/types/project";
import type { DashboardStats } from "@/types/health";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchDashboard()
      .then((data) => {
        setProjects(data.projects);
        setStats(data.stats);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err, "Unable to load dashboard data.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = projects.filter((p) => p.is_active).length;

  const statCards = [
    { label: "Total Projects", value: stats?.total_projects ?? "—" },
    { label: "Online", value: stats?.online ?? "—" },
    { label: "Warning", value: stats?.warning ?? "—" },
    { label: "Offline", value: stats?.offline ?? "—" },
    { label: "Active Alerts", value: stats?.active_alerts ?? "—" },
    { label: "Avg Response Time", value: formatResponseTime(stats?.average_response_time) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good afternoon, {user?.name ?? "Admin"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening across your infrastructure.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={isLoading ? "—" : stat.value} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Projects</CardTitle>
          {!isLoading && projects.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {activeCount} of {projects.length} active
            </span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No projects yet.
                <br />
                Add your first project to start monitoring.
              </p>
              <Button render={<Link href="/projects" />}>
                <Plus />
                Add Project
              </Button>
            </div>
          ) : (
            <ProjectStatusTable projects={projects} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}