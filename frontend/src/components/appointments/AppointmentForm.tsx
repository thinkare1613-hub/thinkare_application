import { DateSelector } from "./DateSelector";
import { DoctorSelect } from "./DoctorSelect";
import { PatientSelect } from "./PatientSelect";
import { TimeSlotSelector } from "./TimeSlotSelector";

type AppointmentFormProps = {
  patients: { id: string; name: string }[];
  doctors: { id: string; name: string }[];
  form: {
    patient: string;
    doctor: string;
    service: string;
    date: string;
    time: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
};

export function AppointmentForm({ patients, doctors, form, onChange, onSubmit }: AppointmentFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Booking</p>
          <h3 className="mt-2 font-serif text-3xl">Create appointment</h3>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PatientSelect
          value={form.patient}
          onChange={(value) => onChange("patient", value)}
          patients={patients}
        />

        <DoctorSelect
          value={form.doctor}
          onChange={(value) => onChange("doctor", value)}
          doctors={doctors}
        />

        <label className="block text-sm font-semibold text-[#1f352f]">
          Service
          <select
            value={form.service}
            onChange={(event) => onChange("service", event.target.value)}
            className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
          >
            <option value="Consultation">Consultation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Check-up">Check-up</option>
            <option value="Diagnostic">Diagnostic</option>
          </select>
        </label>

        <TimeSlotSelector
          value={form.time}
          onChange={(value) => onChange("time", value)}
        />
      </div>

      <DateSelector value={form.date} onChange={(value) => onChange("date", value)} />

      <button className="mt-6 w-full bg-[#19b3a2] px-4 py-3 text-base font-semibold text-white hover:bg-[#149d92]">
        Confirm appointment
      </button>
    </form>
  );
}
