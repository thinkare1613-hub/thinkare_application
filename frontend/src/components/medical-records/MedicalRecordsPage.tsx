import { useState } from "react";
import { EmptyMedicalRecords } from "./EmptyMedicalRecords";
import { MedicalRecordCard } from "./MedicalRecordCard";
import { MedicalRecordFilters } from "./MedicalRecordFilters";
import { MedicalRecordStats } from "./MedicalRecordStats";
import { MedicalRecordTimeline } from "./MedicalRecordTimeline";
import { MedicalRecordViewer } from "./MedicalRecordViewer";
import type { MedicalRecord, MedicalRecordCategory } from "./types";
import { UploadRecordModal } from "./UploadRecordModal";

const records: MedicalRecord[] = [
  { id: "cbc", category: "Lab Reports", title: "Blood Test Report", summary: "Complete Blood Count (CBC)", clinician: "Dr. Sarah Johnson", facility: "City Care Hospital", date: "June 18, 2026", attachment: "CBC_Report.pdf" },
  { id: "visit", category: "Visit Summaries", title: "Consultation", summary: "General Consultation", clinician: "Dr. Michael Smith", facility: "ABC Dental Clinic", date: "June 15, 2026", diagnosis: "Hypertension", prescriptionCount: 2, attachment: "Consultation_Summary.pdf" },
  { id: "prescription", category: "Prescriptions", title: "Follow-up medication", summary: "Blood pressure medication renewal", clinician: "Dr. Michael Smith", facility: "ABC Dental Clinic", date: "May 28, 2026", prescriptionCount: 2, attachment: "Prescription_May_2026.pdf" },
  { id: "xray", category: "Imaging", title: "Chest X-Ray", summary: "Chest radiology imaging", clinician: "Dr. Sarah Johnson", facility: "City Care Hospital", date: "May 10, 2026", attachment: "Chest_XRay.pdf" },
];

export function MedicalRecordsPage() {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState<MedicalRecordCategory>("All Records"); const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null); const [isUploadOpen, setIsUploadOpen] = useState(false); const [recordList, setRecordList] = useState(records); const [message, setMessage] = useState("");
  const visibleRecords = recordList.filter((record) => (category === "All Records" || record.category === category) && `${record.title} ${record.summary} ${record.clinician}`.toLowerCase().includes(search.toLowerCase()));
  const addRecord = ({ title, category: recordCategory, recordDate, fileName }: { title: string; category: Exclude<MedicalRecordCategory, "All Records">; recordDate: string; fileName: string }) => { setRecordList((current) => [{ id: `record-${Date.now()}`, category: recordCategory, title, summary: "Patient-uploaded medical record", clinician: "Patient", facility: "Bhavani Clinic", date: new Date(`${recordDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), attachment: fileName || "No attachment" }, ...current]); setMessage("Record saved successfully."); };
  if (selectedRecord) return <MedicalRecordViewer record={selectedRecord} onBack={() => setSelectedRecord(null)} />;
  return <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Private health history</p><h2 className="mt-2 text-3xl font-bold text-[#17362c] sm:text-4xl">Medical Records</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#587068]">Securely access your medical history, test reports, prescriptions, diagnoses, and visit summaries in one place.</p></div><button type="button" onClick={() => setIsUploadOpen(true)} className="rounded-lg bg-[#19b3a2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#149d92]">+ Upload record</button></div>{message && <p role="status" className="mt-5 rounded-lg border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm text-[#0d523e]">{message}</p>}<div className="mt-7"><MedicalRecordFilters search={search} category={category} onSearchChange={setSearch} onCategoryChange={setCategory} /></div><div className="mt-7"><MedicalRecordStats total={12} reports={8} visits={5} /></div><div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]"><div>{visibleRecords.length ? <div className="grid gap-4 md:grid-cols-2">{visibleRecords.map((record) => <MedicalRecordCard key={record.id} record={record} onView={setSelectedRecord} />)}</div> : <EmptyMedicalRecords onUpload={() => setIsUploadOpen(true)} />}</div><MedicalRecordTimeline records={recordList} /></div><UploadRecordModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={addRecord} /></section>;
}