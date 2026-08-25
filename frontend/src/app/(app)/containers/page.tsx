"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { fetchContainers, restartContainer } from "@/lib/api";
import { extractErrorMessage } from "@/lib/utils";
import type { Container } from "@/types/container";

export default function ContainersPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [available, setAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewingContainer, setViewingContainer] = useState<Container | null>(null);
  const [restartingContainer, setRestartingContainer] = useState<Container | null>(null);

  const load = useCallback(() => {
    fetchContainers()
      .then((res) => {
        setContainers(res.data);
        setAvailable(res.available);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err, "Unable to load containers.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRestart() {
    if (!restartingContainer) return;
    try {
      await restartContainer(restartingContainer.name);
      toast.success(`${restartingContainer.name} restarted.`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to restart container."));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Containers</h1>
        <p className="text-muted-foreground">Docker containers behind your registered projects.</p>
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
          ) : !available ? (
            <div className="flex flex-col items-center gap-1 py-12 text-center">
              <p className="text-sm font-medium">Docker is not available on this host.</p>
              <p className="text-sm text-muted-foreground">
                Container management requires Docker Engine access from the backend.
              </p>
            </div>
          ) : containers.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-12 text-center">
              <p className="text-sm text-muted-foreground">No containers found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow key={container.id}>
                    <TableCell className="font-medium">{container.name}</TableCell>
                    <TableCell>
                      <Badge variant={container.status === "running" ? "success" : "outline"}>
                        {container.status === "running" ? "RUNNING" : "STOPPED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {container.project ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setViewingContainer(container)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setRestartingContainer(container)}
                        >
                          <RotateCw />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingContainer} onOpenChange={(open) => !open && setViewingContainer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingContainer?.name}</DialogTitle>
            <DialogDescription>Container details</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <DetailRow label="Image" value={viewingContainer?.image ?? "—"} />
            <DetailRow label="Container ID" value={viewingContainer?.id.slice(0, 12) ?? "—"} />
            <DetailRow label="Status" value={viewingContainer?.raw_status ?? "—"} />
            <DetailRow label="Project" value={viewingContainer?.project ?? "—"} />
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!restartingContainer}
        onOpenChange={(open) => !open && setRestartingContainer(null)}
        title="Restart container"
        description={`Are you sure you want to restart ${restartingContainer?.name}? It will be briefly unavailable.`}
        confirmLabel="Restart"
        onConfirm={handleRestart}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}