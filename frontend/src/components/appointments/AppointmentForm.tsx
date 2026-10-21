import type { FormEvent } from "react";
import { DateSelector } from "./DateSelector";
import { DoctorSelect } from "./DoctorSelect";
import { PatientSelect } from "./PatientSelect";
import { TimeSlotSelector } from "./TimeSlotSelector";

type AppointmentFormProps = {
  patients: { id: string; name: string }[];
  doctors: { id: string; name: string }[];
  timeSlots?: string[];
  form: {
    patient: string;
    doctor: string;
    service: string;
    date: string;
    time: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AppointmentForm({ patients, doctors, timeSlots, form, onChange, onSubmit }: AppointmentFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]"
    >
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Appointment booking</p>
        <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#17362c]">Schedule an appointment</h3>
        <p className="mt-2 text-sm leading-6 text-[#587068]">Select a patient, doctor, service, date, and available time slot.</p>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-[#dfe9e1] bg-white p-4 sm:grid-cols-4">
        {[
          ["1", "Patient & Doctor"],
          ["2", "Service"],
          ["3", "Date & Time"],
          ["4", "Confirm"],
        ].map(([step, label], index) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`grid size-8 place-items-center rounded-full text-xs font-bold ${index === 0 ? "bg-[#19b3a2] text-white" : "bg-[#edf5f1] text-[#587068]"}`}>
              {step}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#587068]">Step {step}</p>
              <p className="text-sm font-semibold text-[#17362c]">{label}</p>
            </div>
          </div>
        ))}
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
          slots={timeSlots}
        />
      </div>

      <DateSelector value={form.date} onChange={(value) => onChange("date", value)} />

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#dfe9e1] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-[#eaf9f7] text-sm font-bold text-[#19b3a2]">⏱</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#19b3a2]">Selected slot</p>
            <p className="mt-1 text-sm font-semibold text-[#17362c]">
              {form.date || "Select date"} · {form.time || "Select time"} · {form.service || "Consultation"}
            </p>
            <p className="text-sm text-[#587068]">
              {form.patient || "Patient"} · {form.doctor || "Doctor"}
            </p>
          </div>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl bg-[#19b3a2] px-6 py-3 text-base font-semibold text-white hover:bg-[#149d92] lg:min-w-[200px]">
          Continue →
        </button>
      </div>
    </form>
  );
}
