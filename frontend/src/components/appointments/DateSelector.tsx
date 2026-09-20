type DateSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DateSelector({ value, onChange }: DateSelectorProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <label className="mt-4 block text-sm font-semibold text-[#1f352f]">
      Preferred date
      <input
        type="date"
        value={value}
        min={today}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
      />
    </label>
  );
}
