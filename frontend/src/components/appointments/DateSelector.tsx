type DateSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DateSelector({ value, onChange }: DateSelectorProps) {
  return (
    <label className="mt-4 block text-sm font-semibold text-[#1f352f]">
      Preferred date
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
      />
    </label>
  );
}
