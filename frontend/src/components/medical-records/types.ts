export type MedicalRecordCategory = "All Records" | "Lab Reports" | "Prescriptions" | "Visit Summaries" | "Diagnoses" | "Imaging" | "Other";

export type MedicalRecord = {
  id: string;
  category: Exclude<MedicalRecordCategory, "All Records">;
  title: string;
  summary: string;
  clinician: string;
  facility: string;
  date: string;
  diagnosis?: string;
  prescriptionCount?: number;
  attachment: string;
};