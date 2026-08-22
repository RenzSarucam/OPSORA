import axios from "axios";
import type { Project, ProjectInput } from "@/types/project";
import type { DashboardStats, HealthCheckPoint, HealthSummary } from "@/types/health";
import type { Alert } from "@/types/alert";
import type { Server, ServerInput } from "@/types/server";

function resolveApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Session cookies are host-scoped, so the API must be called on whatever
  // host the browser is actually using (localhost vs a LAN IP) rather than
  // a hardcoded value -- otherwise the XSRF cookie becomes invisible to JS.
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
  },
});

export async function ensureCsrfCookie() {
  await api.get("/sanctum/csrf-cookie");
}

export type ApiUser = {
  id: number;
  name: string;
  email: string;
};

export async function fetchCurrentUser(): Promise<ApiUser | null> {
  try {
    const { data } = await api.get<ApiUser>("/api/user");
    return data;
  } catch {
    return null;
  }
}

export async function loginRequest(email: string, password: string) {
  await ensureCsrfCookie();
  const { data } = await api.post<{ user: ApiUser }>("/api/login", {
    email,
    password,
  });
  return data.user;
}

export async function logoutRequest() {
  await api.post("/api/logout");
}

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<{ data: Project[] }>("/api/projects");
  return data.data;
}

export async function fetchProject(id: number): Promise<Project> {
  const { data } = await api.get<{ data: Project }>(`/api/projects/${id}`);
  return data.data;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data } = await api.post<{ data: Project }>("/api/projects", input);
  return data.data;
}

export async function updateProject(id: number, input: ProjectInput): Promise<Project> {
  const { data } = await api.put<{ data: Project }>(`/api/projects/${id}`, input);
  return data.data;
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/api/projects/${id}`);
}

export type DashboardData = {
  stats: DashboardStats;
  projects: Project[];
};

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/api/dashboard");
  return data;
}

export async function fetchProjectHealth(id: number): Promise<HealthSummary> {
  const { data } = await api.get<HealthSummary>(`/api/projects/${id}/health`);
  return data;
}

export async function fetchProjectHealthHistory(id: number): Promise<HealthCheckPoint[]> {
  const { data } = await api.get<{ data: HealthCheckPoint[] }>(`/api/projects/${id}/health-history`);
  return data.data;
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data } = await api.get<{ data: Alert[] }>("/api/alerts");
  return data.data;
}

export async function resolveAlert(id: number): Promise<Alert> {
  const { data } = await api.post<{ data: Alert }>(`/api/alerts/${id}/resolve`);
  return data.data;
}


export async function fetchServers(): Promise<Server[]> {
  const { data } = await api.get<{ data: Server[] }>("/api/servers");
  return data.data;
}

export async function fetchServer(id: number): Promise<Server> {
  const { data } = await api.get<{ data: Server }>(`/api/servers/${id}`);
  return data.data;
}

export async function createServer(input: ServerInput): Promise<Server> {
  const { data } = await api.post<{ data: Server }>("/api/servers", input);
  return data.data;
}

export async function updateServer(id: number, input: ServerInput): Promise<Server> {
  const { data } = await api.put<{ data: Server }>(`/api/servers/${id}`, input);
  return data.data;
}

export async function deleteServer(id: number): Promise<void> {
  await api.delete(`/api/servers/${id}`);
}
