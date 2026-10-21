import { Platform } from "react-native";

const defaultApiUrl = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Cannot reach Thinkare at ${API_URL}. Check the API server and mobile network configuration: ${error.message}`);
    }
    throw error;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
