type MedicalRecordStatsProps = {
  total: number;
  reports: number;
  visits: number;
};

export function MedicalRecordStats({ total, reports, visits }: MedicalRecordStatsProps) {
  const stats = [
    { label: "Total records", value: total },
    { label: "Reports", value: reports },
    { label: "Visits", value: visits },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:max-w-xl sm:gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-[#d8e2d9] bg-white p-4 shadow-[0_6px_18px_rgba(20,108,82,0.04)]">
          <p className="text-2xl font-bold text-[#17362c] sm:text-3xl">{String(stat.value).padStart(2, "0")}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[.08em] text-[#587068]">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}