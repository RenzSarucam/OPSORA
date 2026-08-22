"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, resolveStatus } from "@/components/shared/StatusBadge";
import { formatRelativeTime, formatResponseTime } from "@/lib/utils";
import type { Project } from "@/types/project";

export function ProjectStatusTable({ projects }: { projects: Project[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Environment</TableHead>
          <TableHead>Response Time</TableHead>
          <TableHead>HTTP Status</TableHead>
          <TableHead>Last Check</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow
            key={project.id}
            className="cursor-pointer"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
              <StatusBadge status={resolveStatus(project.is_active, project.latest_health?.status)} />
            </TableCell>
            <TableCell className="text-muted-foreground">{project.environment}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatResponseTime(project.latest_health?.response_time)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {project.latest_health?.http_status ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatRelativeTime(project.latest_health?.checked_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}