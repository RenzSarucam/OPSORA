export type HealthStatus = "online" | "warning" | "offline";

export type HealthSummary = {
  status: HealthStatus | null;
  http_status: number | null;
  response_time: number | null;
  average_response_time: number | null;
  uptime: number | null;
  checked_at: string | null;
};

export type HealthCheckPoint = {
  id: number;
  status: HealthStatus;
  http_status: number | null;
  response_time: number | null;
  checked_at: string;
};

export type DashboardStats = {
  total_projects: number;
  online: number;
  warning: number;
  offline: number;
  active_alerts: number;
  average_response_time: number | null;
};