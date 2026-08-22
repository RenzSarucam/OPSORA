import type { HealthStatus } from "@/types/health";

export type Environment = "Production" | "Staging" | "Development";

export const ENVIRONMENTS: Environment[] = ["Production", "Staging", "Development"];

export type LatestHealth = {
  status: HealthStatus;
  http_status: number | null;
  response_time: number | null;
  checked_at: string;
} | null;

export type Project = {
  id: number;
  name: string;
  description: string | null;
  environment: Environment;
  url: string;
  health_check_url: string;
  server_id: number | null;
  container_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  latest_health?: LatestHealth;
  server?: { id: number; name: string } | null;
};

export type ProjectInput = {
  name: string;
  description: string | null;
  environment: Environment;
  url: string;
  health_check_url: string;
  server_id: number | null;
  container_name: string | null;
  is_active: boolean;
};
