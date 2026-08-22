"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ServerFormDialog } from "@/components/servers/ServerFormDialog";
import { ServerStatusCard } from "@/components/servers/ServerStatusCard";
import { createServer, deleteServer, fetchServers, updateServer } from "@/lib/api";
import { extractErrorMessage } from "@/lib/utils";
import type { Server, ServerInput } from "@/types/server";

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deletingServer, setDeletingServer] = useState<Server | null>(null);

  const load = useCallback(() => {
    fetchServers()
      .then((data) => {
        setServers(data);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err, "Unable to load servers.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAddDialog() {
    setEditingServer(null);
    setFormOpen(true);
  }

  function openEditDialog(server: Server) {
    setEditingServer(server);
    setFormOpen(true);
  }

  async function handleSubmit(input: ServerInput) {
    if (editingServer) {
      const updated = await updateServer(editingServer.id, input);
      setServers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.success(`${updated.name} updated.`);
    } else {
      const created = await createServer(input);
      setServers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`${created.name} added.`);
    }
  }

  async function handleDelete() {
    if (!deletingServer) return;
    try {
      await deleteServer(deletingServer.id);
      setServers((prev) => prev.filter((s) => s.id !== deletingServer.id));
      toast.success(`${deletingServer.name} deleted.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to delete server."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Servers</h1>
          <p className="text-muted-foreground">Servers registered for reference and linking.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus />
          Add Server
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : servers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No servers yet.
              <br />
              Register a server to start linking it to projects.
            </p>
            <Button onClick={openAddDialog}>
              <Plus />
              Add Server
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerStatusCard
              key={server.id}
              server={server}
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(server)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeletingServer(server)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))}
        </div>
      )}

      <ServerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        server={editingServer}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingServer}
        onOpenChange={(open) => !open && setDeletingServer(null)}
        title="Delete server"
        description={`Are you sure you want to delete ${deletingServer?.name}? Projects linked to it will be unlinked, not deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}