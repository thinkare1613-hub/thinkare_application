import type { MedicalRecordCategory } from "./types";

type MedicalRecordFiltersProps = {
  search: string;
  category: MedicalRecordCategory;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: MedicalRecordCategory) => void;
};

const categories: MedicalRecordCategory[] = ["All Records", "Lab Reports", "Prescriptions", "Visit Summaries", "Diagnoses", "Imaging", "Other"];

export function MedicalRecordFilters({ search, category, onSearchChange, onCategoryChange }: MedicalRecordFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search records..." aria-label="Search records" className="min-w-0 flex-1 rounded-xl border border-[#c7d5ca] bg-white px-4 py-3 text-sm text-[#17362c] outline-none focus:border-[#19b3a2] focus:ring-2 focus:ring-[#19b3a2]/10" />
        <select value={category} onChange={(event) => onCategoryChange(event.target.value as MedicalRecordCategory)} aria-label="Filter record type" className="rounded-xl border border-[#c7d5ca] bg-white px-4 py-3 text-sm font-semibold text-[#17362c] outline-none focus:border-[#19b3a2]">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Filter records by date" className="rounded-xl border border-[#c7d5ca] bg-white px-4 py-3 text-sm font-semibold text-[#17362c] outline-none focus:border-[#19b3a2]">
          <option>All dates</option><option>Last 30 days</option><option>This year</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => <button key={item} type="button" onClick={() => onCategoryChange(item)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${category === item ? "bg-[#19b3a2] text-white" : "border border-[#c7d5ca] bg-white text-[#17362c] hover:border-[#19b3a2]"}`}>{item}</button>)}
      </div>
    </div>
  );
}