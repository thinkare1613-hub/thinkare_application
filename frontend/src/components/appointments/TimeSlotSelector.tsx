type TimeSlotSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  slots?: string[];
};

const defaultSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:15 PM", "03:30 PM"];

export function TimeSlotSelector({ value, onChange, slots = defaultSlots }: TimeSlotSelectorProps) {
  return (
    <label className="block text-sm font-semibold text-[#1f352f]">
      Time slot
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
      >
        {slots.map((slot) => (
          <option key={slot} value={slot}>{slot}</option>
        ))}
      </select>
    </label>
  );
}
