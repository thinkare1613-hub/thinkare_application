import { request } from "./api";

export type PatientSession = { access_token: string; user: { id: string; email: string; role: string } };

export function sendPatientOtp(phone: string) {
  return request<{ message: string }>("/api/auth/patient/send-otp", { method: "POST", body: JSON.stringify({ phone }) });
}

export function verifyPatientOtp(phone: string, otp: string) {
  return request<PatientSession>("/api/auth/patient/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) });
}
