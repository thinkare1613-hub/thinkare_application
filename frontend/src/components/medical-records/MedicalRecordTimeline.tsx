import type { MedicalRecord } from "./types";

type MedicalRecordTimelineProps = { records: MedicalRecord[] };

export function MedicalRecordTimeline({ records }: MedicalRecordTimelineProps) {
  return <section className="rounded-xl border border-[#d8e2d9] bg-white p-5"><p className="text-sm font-bold uppercase tracking-[.1em] text-[#19b3a2]">Visit timeline</p><ol className="mt-5 border-l-2 border-[#b9e4dc] pl-5">{records.map((record) => <li key={record.id} className="relative pb-5 last:pb-0"><span className="absolute -left-[1.72rem] top-1 h-3 w-3 rounded-full bg-[#19b3a2]" /><p className="text-xs font-bold text-[#587068]">{record.date}</p><p className="mt-1 font-semibold text-[#17362c]">{record.title}</p><p className="text-sm text-[#587068]">{record.summary}</p></li>)}</ol></section>;
}