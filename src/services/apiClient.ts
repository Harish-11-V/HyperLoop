/**
 * Thin API abstraction layer.
 *
 * DEMO_MODE = true  -> all services resolve from the local demo dataset.
 * DEMO_MODE = false -> services call the future FastAPI backend at API_BASE_URL.
 *
 * UI components must never call fetch() directly; they go through the
 * service modules in this folder.
 */

export const DEMO_MODE =
  (import.meta.env["VITE_DEMO_MODE"] ?? "true") !== "false";

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "/api";

/** Simulated network latency so demo mode behaves like a real request. */
export function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return (await response.json()) as T;
}
