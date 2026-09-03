import { request } from "./api";

export type Clinic = { id: string; name: string; city?: string; address?: string; verified?: boolean };

export function verifyClinicQr(token: string) {
  return request<{ valid: boolean; clinic: Clinic }>("/api/clinics/qr/verify", { method: "POST", body: JSON.stringify({ token }) });
}
