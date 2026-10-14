type PatientSelectProps = {
  value: string;
  onChange: (value: string) => void;
  patients: { id: string; name: string }[];
};

export function PatientSelect({ value, onChange, patients }: PatientSelectProps) {
  const hasPatients = patients.length > 0;

  return (
    <label className="block text-sm font-semibold text-[#1f352f]">
      Patient
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
      >
        <option value="" disabled>
          {hasPatients ? "Select a patient" : "No patients loaded yet"}
        </option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.name}>{patient.name}</option>
        ))}
      </select>
    </label>
  );
}
