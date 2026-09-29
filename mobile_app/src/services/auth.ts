import { request } from "./api";

export type PatientSession = { access_token: string; user: { id: string; email?: string; role: string; name?: string } };

export function sendPatientOtp(clinicSlug: string, phone: string, name: string) {
  return request<{ message: string; otp: string }>("/api/auth/patient/send-otp", { method: "POST", body: JSON.stringify({ clinic_slug: clinicSlug, phone, name }) });
}

export function verifyPatientOtp(clinicSlug: string, phone: string, otp: string) {
  return request<PatientSession>("/api/auth/patient/verify-otp", { method: "POST", body: JSON.stringify({ clinic_slug: clinicSlug, phone, otp }) });
}
