export type AlertSeverity = "warning" | "critical";
export type AlertStatus = "active" | "resolved";

export type Alert = {
  id: number;
  project: {
    id: number;
    name: string;
  };
  type: string;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  created_at: string;
  resolved_at: string | null;
};