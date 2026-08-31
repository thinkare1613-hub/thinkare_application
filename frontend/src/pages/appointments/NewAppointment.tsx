import { AppointmentForm } from "../../components/appointments/AppointmentForm";

const patients = [
  { id: "p1", name: "Aarav Sharma" },
  { id: "p2", name: "Meera Iyer" },
  { id: "p3", name: "Kabir Khan" },
  { id: "p4", name: "Naina Verma" },
];

const doctors = [
  { id: "d1", name: "Dr. Ananya Rao" },
  { id: "d2", name: "Dr. Kabir Menon" },
  { id: "d3", name: "Dr. Aisha Patel" },
  { id: "d4", name: "Dr. Rahul Bose" },
];

export function NewAppointmentPage() {
  const form = {
    patient: "Aarav Sharma",
    doctor: "Dr. Ananya Rao",
    service: "Consultation",
    date: "2026-08-30",
    time: "09:00 AM",
  };

  function handleChange(field: string, value: string) {
    console.log(field, value);
  }

  function handleSubmit() {
    console.log("submit booking", form);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
      <AppointmentForm
        patients={patients}
        doctors={doctors}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
