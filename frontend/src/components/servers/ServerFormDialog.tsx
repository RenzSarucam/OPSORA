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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVER_ENVIRONMENTS, type Server, type ServerInput } from "@/types/server";
import { extractErrorMessage } from "@/lib/utils";

const EMPTY_FORM: ServerInput = {
  name: "",
  host: "",
  environment: "Production",
  is_active: true,
};

export function ServerFormDialog({
  open,
  onOpenChange,
  server,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: Server | null;
  onSubmit: (input: ServerInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ServerInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state whenever the dialog transitions from closed to open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setError(null);
      setForm(
        server
          ? {
              name: server.name,
              host: server.host,
              environment: server.environment,
              is_active: server.is_active,
            }
          : EMPTY_FORM
      );
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
      setError(extractErrorMessage(err, "Unable to save server. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{server ? "Edit Server" : "Add Server"}</DialogTitle>
            <DialogDescription>
              {server
                ? "Update this server's registration."
                : "Register a server to associate with projects."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input
                id="name"
                required
                placeholder="Production Server"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                required
                placeholder="prod.internal or 10.0.0.5"
                value={form.host}
                onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={form.environment}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, environment: value as ServerInput["environment"] }))
                }
              >
                <SelectTrigger id="environment" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVER_ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isSubmitting ? "Saving…" : server ? "Save Changes" : "Add Server"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}