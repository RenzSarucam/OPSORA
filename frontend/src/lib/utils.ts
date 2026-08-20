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