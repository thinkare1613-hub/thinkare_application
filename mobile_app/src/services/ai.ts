import { request } from "./api";

export type MobileAIContext = {
  screen: string;
  role: string;
  clinic_id: string;
  summary: string;
  signals: string[];
  suggested_actions: string[];
  confidence: "low" | "medium" | "high";
  requires_approval: boolean;
  recommended_doctor?: { id: string; name: string } | null;
  recommended_date?: string | null;
  patient_name?: string | null;
};

export function fetchMobileAiContext(token: string, screen: string, patientName?: string) {
  const params = new URLSearchParams({ screen });
  if (patientName?.trim()) {
    params.set("patient_name", patientName.trim());
  }

  return request<MobileAIContext>(`/api/ai/context?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}