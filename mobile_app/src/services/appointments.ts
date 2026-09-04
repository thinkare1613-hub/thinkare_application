import { request } from "./api";

export type Doctor = { id: string; name: string };
export type Slot = { id: string; start_time: string; end_time: string };

export function listDoctors(token: string) {
  return request<Doctor[]>("/api/doctors", { headers: { Authorization: `Bearer ${token}` } });
}

export function listSlots(token: string, doctorId: string, slotDate: string) {
  return request<Slot[]>(`/api/slots?doctor_id=${encodeURIComponent(doctorId)}&slot_date=${encodeURIComponent(slotDate)}`, { headers: { Authorization: `Bearer ${token}` } });
}

export function bookAppointment(token: string, slotId: string, reason: string) {
  return request<{ id: string; appointment_number: string }>("/api/appointments", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ slot_id: slotId, reason }) });
}