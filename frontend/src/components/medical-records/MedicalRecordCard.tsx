import type { MedicalRecord } from "./types";

type MedicalRecordCardProps = {
  record: MedicalRecord;
  onView: (record: MedicalRecord) => void;
};

const categoryLabels: Record<MedicalRecord["category"], string> = { "Lab Reports": "Lab report", Prescriptions: "Prescription", "Visit Summaries": "Consultation", Diagnoses: "Diagnosis", Imaging: "Imaging", Other: "Record" };

export function MedicalRecordCard({ record, onView }: MedicalRecordCardProps) {
  return (
    <article className="rounded-xl border border-[#d8e2d9] bg-white p-5 shadow-[0_6px_18px_rgba(20,108,82,0.04)]">
      <p className="text-xs font-bold uppercase tracking-[.1em] text-[#19b3a2]">{categoryLabels[record.category]}</p>
      <h3 className="mt-2 text-xl font-bold text-[#17362c]">{record.title}</h3>
      <p className="mt-2 text-sm text-[#587068]">{record.summary}</p>
      <p className="mt-3 text-sm font-medium text-[#17362c]">{record.clinician} <span className="text-[#78908a]">at {record.facility}</span></p>
      <p className="mt-3 text-sm text-[#587068]">{record.date}</p>
      {(record.diagnosis || record.prescriptionCount) && <div className="mt-4 rounded-lg bg-[#f3f8f4] p-3 text-sm text-[#587068]">{record.diagnosis && <p>Diagnosis: {record.diagnosis}</p>}{record.prescriptionCount && <p>Prescription: {record.prescriptionCount} medications</p>}</div>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => onView(record)} className="rounded-lg bg-[#19b3a2] px-3 py-2 text-sm font-semibold text-white hover:bg-[#149d92]">{record.category === "Visit Summaries" ? "View summary" : "View report"}</button>
        <button type="button" onClick={() => window.print()} className="rounded-lg border border-[#c7d5ca] px-3 py-2 text-sm font-semibold text-[#17362c] hover:bg-[#f3f8f4]">Print</button>
      </div>
    </article>
  );
}