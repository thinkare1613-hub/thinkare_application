export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.29.157:8000";

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = options?.headers && new Headers(options.headers).get("Authorization");
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: token } : {}), ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
