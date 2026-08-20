import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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