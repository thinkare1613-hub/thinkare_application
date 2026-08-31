type DoctorSelectProps = {
  value: string;
  onChange: (value: string) => void;
  doctors: { id: string; name: string }[];
};

export function DoctorSelect({ value, onChange, doctors }: DoctorSelectProps) {
  return (
    <label className="block text-sm font-semibold text-[#1f352f]">
      Doctor
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
      >
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
        ))}
      </select>
    </label>
  );
}
