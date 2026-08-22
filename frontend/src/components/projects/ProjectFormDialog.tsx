"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENVIRONMENTS, type Project, type ProjectInput } from "@/types/project";
import type { Server } from "@/types/server";
import { extractErrorMessage } from "@/lib/utils";
import { fetchServers } from "@/lib/api";

const EMPTY_FORM: ProjectInput = {
  name: "",
  description: null,
  environment: "Production",
  url: "",
  health_check_url: "",
  server_id: null,
  container_name: null,
  is_active: true,
};

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSubmit: (input: ProjectInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM);
  const [servers, setServers] = useState<Server[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state whenever the dialog transitions from closed to open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setError(null);
      setForm(
        project
          ? {
              name: project.name,
              description: project.description,
              environment: project.environment,
              url: project.url,
              health_check_url: project.health_check_url,
              server_id: project.server_id,
              container_name: project.container_name,
              is_active: project.is_active,
            }
          : EMPTY_FORM
      );
      fetchServers()
        .then(setServers)
        .catch(() => setServers([]));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to save project. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
            <DialogDescription>
              {project
                ? "Update this project's monitoring configuration."
                : "Register a new application to monitor."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value || null }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={form.environment}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, environment: value as ProjectInput["environment"] }))
                }
              >
                <SelectTrigger id="environment" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Application URL</Label>
              <Input
                id="url"
                type="url"
                required
                placeholder="https://example.com"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_check_url">Health Check URL</Label>
              <Input
                id="health_check_url"
                type="url"
                required
                placeholder="https://example.com/api/health"
                value={form.health_check_url}
                onChange={(e) => setForm((f) => ({ ...f, health_check_url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server_id">Server</Label>
              <Select
                value={form.server_id != null ? String(form.server_id) : "none"}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, server_id: value === "none" ? null : Number(value) }))
                }
              >
                <SelectTrigger id="server_id" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={String(server.id)}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="container_name">Container</Label>
              <Input
                id="container_name"
                placeholder="my-app-container"
                value={form.container_name ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, container_name: e.target.value || null }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : project ? "Save Changes" : "Add Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
