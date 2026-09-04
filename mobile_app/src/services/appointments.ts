import { request } from "./api";

export type AppointmentSlot = {
  id: string;
  start_time: string;
  end_time: string;
};

export function getAvailableSlots(doctorId: string, slotDate: string, token: string) {
  return request<AppointmentSlot[]>(`/api/slots?doctor_id=${encodeURIComponent(doctorId)}&slot_date=${encodeURIComponent(slotDate)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function bookAppointment(slotId: string, patientId: string, reason: string, token: string) {
  return request<{ id: string; appointment_number: string }>("/api/appointments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slot_id: slotId, patient_id: patientId, reason }),
  });
}