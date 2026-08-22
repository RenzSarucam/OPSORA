"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge, resolveStatus } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { createProject, deleteProject, fetchProjects, updateProject } from "@/lib/api";
import { extractErrorMessage } from "@/lib/utils";
import type { Project, ProjectInput } from "@/types/project";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const load = useCallback(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err, "Unable to load projects.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAddDialog() {
    setEditingProject(null);
    setFormOpen(true);
  }

  function openEditDialog(project: Project) {
    setEditingProject(project);
    setFormOpen(true);
  }

  async function handleSubmit(input: ProjectInput) {
    if (editingProject) {
      const updated = await updateProject(editingProject.id, input);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`${updated.name} updated.`);
    } else {
      const created = await createProject(input);
      setProjects((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`${created.name} added.`);
    }
  }

  async function handleToggleActive(project: Project, isActive: boolean) {
    const previous = projects;
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, is_active: isActive } : p))
    );
    try {
      await updateProject(project.id, { ...toInput(project), is_active: isActive });
    } catch (err) {
      setProjects(previous);
      toast.error(extractErrorMessage(err, "Unable to update project."));
    }
  }

  async function handleDelete() {
    if (!deletingProject) return;
    try {
      await deleteProject(deletingProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      toast.success(`${deletingProject.name} deleted.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to delete project."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Applications registered for monitoring.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus />
          Add Project
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
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
              <Button onClick={openAddDialog}>
                <Plus />
                Add Project
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell
                      className="cursor-pointer font-medium"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={resolveStatus(project.is_active, project.latest_health?.status)} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.environment}</TableCell>
                    <TableCell>
                      <Switch
                        checked={project.is_active}
                        onCheckedChange={(checked) => handleToggleActive(project, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(project)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletingProject(project)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        title="Delete project"
        description={`Are you sure you want to delete ${deletingProject?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function toInput(project: Project): ProjectInput {
  return {
    name: project.name,
    description: project.description,
    environment: project.environment,
    url: project.url,
    health_check_url: project.health_check_url,
    server_id: project.server_id,
    container_name: project.container_name,
    is_active: project.is_active,
  };
}
