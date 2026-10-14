type TimeSlotSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  slots?: string[];
};

const defaultSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:15 PM", "03:30 PM"];

export function TimeSlotSelector({ value, onChange, slots = defaultSlots }: TimeSlotSelectorProps) {
  const visibleSlots = slots.length > 0 ? slots : defaultSlots;
  const hasLiveSlots = slots.length > 0;

  return (
    <fieldset className="text-sm font-semibold text-[#1f352f]">
      <legend>Available time slots</legend>
      {!hasLiveSlots ? (
        <p className="mt-2 text-xs font-medium text-[#587068]">Select a doctor and date to load live availability. Default slots are shown for now.</p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visibleSlots.map((slot) => {
          const isSelected = value === slot;

          return (
            <button
              key={slot}
              type="button"
              onClick={() => onChange(slot)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${isSelected ? "border-[#19b3a2] bg-[#19b3a2] text-white shadow-sm" : "border-[#c7d5ca] bg-white text-[#17362c] hover:border-[#19b3a2] hover:bg-[#f0faf8]"}`}
            >
              {isSelected && <span className="mr-1">✓</span>}
              {slot}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
