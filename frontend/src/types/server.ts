export type ServerEnvironment = "Production" | "Staging" | "Development";

export const SERVER_ENVIRONMENTS: ServerEnvironment[] = ["Production", "Staging", "Development"];

export type ServerMetrics = {
  available: boolean;
  cpu: number | null;
  memory: number | null;
  disk: number | null;
};

export type Server = {
  id: number;
  name: string;
  host: string;
  environment: ServerEnvironment;
  is_active: boolean;
  metrics: ServerMetrics;
  created_at: string;
  updated_at: string;
};

export type ServerInput = {
  name: string;
  host: string;
  environment: ServerEnvironment;
  is_active: boolean;
};