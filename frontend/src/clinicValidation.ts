export function validatePatientDoctorClinicMatch(
  patientClinicId: string | null | undefined,
  doctorClinicId: string | null | undefined,
): string | null {
  if (!patientClinicId || !doctorClinicId) {
    return null;
  }

  if (patientClinicId !== doctorClinicId) {
    return 'This patient can only be assigned to a doctor from the same clinic.';
  }

  return null;
}
