import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LaravelErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: LaravelErrorResponse } }).response;
    const firstFieldError = Object.values(response?.data?.errors ?? {})[0]?.[0];
    if (firstFieldError) {
      return firstFieldError;
    }
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return fallback;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";

  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec} sec ago`;

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  return `${Math.round(diffHour / 24)}d ago`;
}

export function formatResponseTime(ms: number | null | undefined): string {
  return ms != null ? `${ms}ms` : "—";
}