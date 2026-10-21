import { request } from "./api";

export type WearableStatus = {
  provider: string;
  connected: boolean;
  consent_granted: boolean;
  consent_version: string | null;
  provider_ready: boolean;
  health_connect_available: boolean;
  connection_method: string | null;
  latest_sync_at: string | null;
  latest_metric_at: string | null;
  message: string;
};

export type HealthMetric = {
  id: string;
  provider: string;
  metric_type: string;
  metric_value: string;
  unit: string;
  recorded_at: string;
};

export function getFitbitStatus(token: string) {
  return request<WearableStatus>("/api/wearables/fitbit/status", { headers: { Authorization: `Bearer ${token}` } });
}

export function getWearableMetrics(token: string) {
  return request<HealthMetric[]>("/api/wearables/health-metrics", { headers: { Authorization: `Bearer ${token}` } });
}

export function updateFitbitConsent(token: string, granted: boolean) {
  return request<{ consent_granted: boolean }>("/api/wearables/fitbit/consent", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ granted, consent_version: "2026-10-15-v1" }),
  });
}

export function syncFitbit(token: string, metrics: Array<{ metric_type: "steps" | "heart_rate" | "sleep_duration"; metric_value: number; unit: "count" | "bpm" | "minutes"; recorded_at: string }>) {
  return request<{ synced_count: number; received_count: number }>("/api/wearables/fitbit/sync", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ source: "health_connect", metrics }),
  });
}

export function disconnectFitbit(token: string) {
  return request<{ connected: boolean; health_metrics_preserved: boolean }>("/api/wearables/fitbit/disconnect", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteWearableMetrics(token: string) {
  return request<{ deleted_count: number }>("/api/wearables/health-metrics", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
