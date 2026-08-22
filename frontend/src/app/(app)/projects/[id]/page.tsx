"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge, resolveStatus } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ResponseTimeChart } from "@/components/dashboard/ResponseTimeChart";
import {
  deleteProject,
  fetchProject,
  fetchProjectHealth,
  fetchProjectHealthHistory,
  updateProject,
} from "@/lib/api";
import { extractErrorMessage, formatRelativeTime, formatResponseTime } from "@/lib/utils";
import type { Project, ProjectInput } from "@/types/project";
import type { HealthCheckPoint, HealthSummary } from "@/types/health";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [history, setHistory] = useState<HealthCheckPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetchProject(projectId),
      fetchProjectHealth(projectId),
      fetchProjectHealthHistory(projectId),
    ])
      .then(([projectData, healthData, historyData]) => {
        setProject(projectData);
        setHealth(healthData);
        setHistory(historyData);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err, "Unable to load this project.")))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(input: ProjectInput) {
    if (!project) return;
    const updated = await updateProject(project.id, input);
    setProject(updated);
    toast.success(`${updated.name} updated.`);
  }

  async function handleDelete() {
    if (!project) return;
    await deleteProject(project.id);
    toast.success(`${project.name} deleted.`);
    router.push("/projects");
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
          <ArrowLeft />
          Back to Projects
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error ?? "Project not found."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = [
    { label: "Current Response", value: formatResponseTime(health?.response_time) },
    { label: "Average Response", value: formatResponseTime(health?.average_response_time) },
    { label: "Uptime", value: health?.uptime != null ? `${health.uptime}%` : "N/A" },
    { label: "HTTP Status", value: health?.http_status ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
          <ArrowLeft />
          Back to Projects
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            <Pencil />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        <StatusBadge status={resolveStatus(project.is_active, health?.status)} />
      </div>
      {project.description && (
        <p className="-mt-4 text-muted-foreground">{project.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DetailRow label="Environment" value={project.environment} />
          <DetailRow
            label="Application URL"
            value={
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {project.url}
                <ExternalLink className="size-3.5" />
              </a>
            }
          />
          <DetailRow
            label="Health Check URL"
            value={
              <a
                href={project.health_check_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {project.health_check_url}
                <ExternalLink className="size-3.5" />
              </a>
            }
          />
          <DetailRow
            label="Server"
            value={
              project.server ? (
                <Link href="/servers" className="text-primary hover:underline">
                  {project.server.name}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <DetailRow label="Container" value={project.container_name ?? "—"} />
          <DetailRow label="Last Checked" value={formatRelativeTime(health?.checked_at)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health History (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No health check data yet. The 24-hour history chart will appear here once
              monitoring starts.
            </p>
          ) : (
            <ResponseTimeChart points={history} />
          )}
        </CardContent>
      </Card>

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={project}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project"
        description={`Are you sure you want to delete ${project.name}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}