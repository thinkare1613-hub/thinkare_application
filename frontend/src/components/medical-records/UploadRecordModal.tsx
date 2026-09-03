import { useState } from "react";
import type { MedicalRecordCategory } from "./types";

type UploadRecordPayload = { title: string; category: Exclude<MedicalRecordCategory, "All Records">; recordDate: string; fileName: string };
type UploadRecordModalProps = { isOpen: boolean; onClose: () => void; onUpload: (payload: UploadRecordPayload) => void };

export function UploadRecordModal({ isOpen, onClose, onUpload }: UploadRecordModalProps) {
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState<Exclude<MedicalRecordCategory, "All Records">>("Other");
	const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 10));
	const [fileName, setFileName] = useState("");

	if (!isOpen) return null;

	return <div className="fixed inset-0 z-50 grid place-items-center bg-[#17362c]/40 p-4" role="dialog" aria-modal="true" aria-label="Upload medical record"><form className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onSubmit={(event) => { event.preventDefault(); onUpload({ title, category, recordDate, fileName }); setTitle(""); setFileName(""); onClose(); }}><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-[#17362c]">Upload medical record</h2><button type="button" onClick={onClose} className="text-lg text-[#587068]" aria-label="Close upload dialog">x</button></div><label className="mt-5 block text-sm font-semibold">Record title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-[#c7d5ca] px-3 py-2.5" /></label><label className="mt-4 block text-sm font-semibold">Record type<select value={category} onChange={(event) => setCategory(event.target.value as Exclude<MedicalRecordCategory, "All Records">)} className="mt-2 w-full rounded-lg border border-[#c7d5ca] px-3 py-2.5"><option>Lab Reports</option><option>Prescriptions</option><option>Visit Summaries</option><option>Diagnoses</option><option>Imaging</option><option>Other</option></select></label><label className="mt-4 block text-sm font-semibold">Record date<input required type="date" value={recordDate} onChange={(event) => setRecordDate(event.target.value)} className="mt-2 w-full rounded-lg border border-[#c7d5ca] px-3 py-2.5" /></label><label className="mt-4 block text-sm font-semibold">Record file <span className="font-normal text-[#587068]">(optional)</span><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} className="mt-2 block w-full text-sm" /></label><button className="mt-6 w-full rounded-lg bg-[#19b3a2] px-4 py-3 text-sm font-semibold text-white">Save record</button></form></div>;
}