import { useState } from "react";
import type { FormEvent } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

type Screen = "login" | "dashboard" | "appointments" | "patients" | "doctors" | "clinics" | "availability" | "billing" | "settings";

type Appointment = {
  time: string;
  patient: string;
  doctor: string;
  service: string;
  status: "Confirmed" | "Waiting" | "In progress" | "Completed" | "Cancelled";
};

type Doctor = {
  name: string;
  specialty: string;
  availability: string;
  rating: number;
};

type Patient = {
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
};

const initialAppointments: Appointment[] = [
  { time: "09:00 AM", patient: "Aarav Sharma", doctor: "Dr. Ananya Rao", service: "Consultation", status: "Confirmed" },
  { time: "10:30 AM", patient: "Meera Iyer", doctor: "Dr. Kabir Menon", service: "Follow-up", status: "Waiting" },
  { time: "12:00 PM", patient: "Kabir Khan", doctor: "Dr. Aisha Patel", service: "Consultation", status: "In progress" },
  { time: "02:15 PM", patient: "Naina Verma", doctor: "Dr. Rahul Bose", service: "Check-up", status: "Completed" },
  { time: "03:30 PM", patient: "Zoya Ali", doctor: "Dr. Saanvi Nair", service: "Consultation", status: "Cancelled" },
];

const doctors: Doctor[] = [
  { name: "Dr. Ananya Rao", specialty: "Cardiology", availability: "Available today", rating: 4.9 },
  { name: "Dr. Kabir Menon", specialty: "Dermatology", availability: "Next slot 1:00 PM", rating: 4.8 },
  { name: "Dr. Aisha Patel", specialty: "Pediatrics", availability: "Available today", rating: 5.0 },
  { name: "Dr. Rahul Bose", specialty: "Orthopedics", availability: "Next slot 3:30 PM", rating: 4.7 },
];

const patients: Patient[] = [
  { name: "Aarav Sharma", email: "aarav@gmail.com", phone: "+1 415 890 7712", lastVisit: "2 days ago" },
  { name: "Meera Iyer", email: "meera@gmail.com", phone: "+1 425 810 2856", lastVisit: "4 days ago" },
  { name: "Kabir Khan", email: "kabir@gmail.com", phone: "+1 510 621 4449", lastVisit: "1 week ago" },
  { name: "Naina Verma", email: "naina@gmail.com", phone: "+1 602 745 2200", lastVisit: "Today" },
];

const summaryCards = [
  { label: "Today", value: "24", tone: "bg-[#146c52] text-white" },
  { label: "Confirmed", value: "6", tone: "bg-[#eaf5ef] text-[#0d523e]" },
  { label: "Waiting", value: "2", tone: "bg-[#fff7e9] text-[#8a5e00]" },
  { label: "Completed", value: "3", tone: "bg-[#edf3ff] text-[#1f3d7a]" },
];

const quickActions = ["+ New appointment", "Patients", "Doctors", "Schedule"];

const pageMeta: Record<Exclude<Screen, "login">, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of patient flow and clinic performance." },
  appointments: { title: "Appointments", subtitle: "Track visits, check-in status, and upcoming time slots." },
  patients: { title: "Patients", subtitle: "View patient history, records, and follow-up plans." },
  doctors: { title: "Doctors", subtitle: "Team coverage, schedules, and consultation workloads." },
  clinics: { title: "Clinics", subtitle: "Manage locations, capacity, and operational coverage." },
  availability: { title: "Availability", subtitle: "Control schedules, working hours, and open slots." },
  billing: { title: "Billing", subtitle: "Review payments, outstanding balances, and invoices." },
  settings: { title: "Settings", subtitle: "Configure team roles, access, and clinic preferences." },
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001";

function statusClasses(status: Appointment["status"]) {
  switch (status) {
    case "Confirmed":
      return "bg-[#eaf5ef] text-[#0d523e]";
    case "Waiting":
      return "bg-[#fff7e9] text-[#8a5e00]";
    case "In progress":
      return "bg-[#edf3ff] text-[#1f3d7a]";
    case "Completed":
      return "bg-[#e7f7ef] text-[#0c6b51]";
    case "Cancelled":
      return "bg-[#fce9eb] text-[#8a1f2d]";
    default:
      return "bg-[#edf3ff] text-[#1f3d7a]";
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@123");
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState<Appointment[]>(initialAppointments);
  const [bookingForm, setBookingForm] = useState({
    patient: "Aarav Sharma",
    doctor: "Dr. Ananya Rao",
    service: "Consultation",
    date: "2026-08-30",
    time: "09:00 AM",
  });

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Sign in failed");
      }

      setMessage(`Welcome back, ${email.split("@")[0] || "clinic admin"}.`);
      setScreen("dashboard");
    } catch {
      setMessage("Unable to sign in. Confirm the FastAPI backend is running.");
    }
  }

  function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newAppointment: Appointment = {
      patient: bookingForm.patient,
      doctor: bookingForm.doctor,
      service: bookingForm.service,
      time: bookingForm.time,
      status: "Confirmed",
    };

    setSchedule((current) => [newAppointment, ...current]);
    setMessage(`Booking created for ${bookingForm.patient} with ${bookingForm.doctor}.`);
    setBookingForm({
      patient: "Aarav Sharma",
      doctor: "Dr. Ananya Rao",
      service: "Consultation",
      date: "2026-08-30",
      time: "09:00 AM",
    });
    setScreen("appointments");
  }

  if (screen === "login") {
    return (
      <main className="min-h-screen bg-[#e9f0eb] p-5 text-[#17362c] lg:grid lg:place-items-center">
        <section className="grid w-full max-w-5xl overflow-hidden border border-[#c7d5ca] bg-[#fcfdf9] shadow-[0_18px_60px_rgba(23,54,44,.13)] lg:grid-cols-[1.05fr_.95fr]">
          <div className="bg-[#146c52] p-8 text-white sm:p-12">
            <p className="text-xs font-bold tracking-[.18em] text-[#bfe0ca]">THINKARE</p>
            <h1 className="mt-10 font-serif text-5xl leading-[1.02]">Care starts with a clear day.</h1>
            <p className="mt-6 max-w-sm text-[#d3e8da]">
              Appointments, availability, and patient flow for clinics that want less friction.
            </p>
          </div>

          <form onSubmit={login} className="p-8 sm:p-12">
            <p className="text-sm font-bold tracking-[.12em] text-[#146c52]">CLINIC PORTAL</p>
            <h2 className="mt-3 font-serif text-4xl">Welcome back</h2>
            <p className="mt-3 text-[#587068]">Sign in to manage today&apos;s care.</p>

            <label className="mt-9 block text-sm font-semibold">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                placeholder="you@clinic.com"
                className="mt-2 w-full border border-[#b9cbbd] bg-white px-3 py-3 font-normal outline-none focus:border-[#146c52]"
              />
            </label>

            <label className="mt-5 block text-sm font-semibold">
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                placeholder="Enter password"
                className="mt-2 w-full border border-[#b9cbbd] bg-white px-3 py-3 font-normal outline-none focus:border-[#146c52]"
              />
            </label>

            <button className="mt-7 w-full bg-[#146c52] py-3 font-semibold text-white hover:bg-[#0d523e]">
              Sign in
            </button>
          </form>
        </section>
      </main>
    );
  }

  const activeMeta = pageMeta[screen as keyof typeof pageMeta];

  return (
    <div className="min-h-screen bg-[#f3f6f3] text-[#17362c]">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar activePage={screen} onSelectPage={(page) => setScreen(page as Screen)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <Header title={activeMeta.title} subtitle={activeMeta.subtitle} />

          <main className="flex-1">
            {screen === "dashboard" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="flex flex-col gap-5 border-b border-[#d8e2d9] pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[.14em] text-[#146c52]">Monday, 30 August</p>
                    <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Clinic operations dashboard</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        className={
                          action.startsWith("+")
                            ? "rounded-xl bg-[#146c52] px-4 py-2.5 text-sm font-semibold text-white"
                            : "rounded-xl border border-[#c7d5ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#17362c]"
                        }
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {message && (
                  <p className="mt-6 rounded-xl border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm text-[#0d523e]">
                    {message}
                  </p>
                )}

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  {summaryCards.map((card) => (
                    <div key={card.label} className={`rounded-2xl border border-[#d8e2d9] p-5 ${card.tone}`}>
                      <p className="text-sm font-medium opacity-80">{card.label}</p>
                      <p className="mt-3 text-3xl font-bold">{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                  <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)] sm:p-6">
                    <div className="flex items-center justify-between pb-4">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#146c52]">Today's schedule</p>
                        <h3 className="mt-2 font-serif text-2xl">Appointments</h3>
                      </div>
                      <button className="text-sm font-semibold text-[#146c52]">View all</button>
                    </div>

                    <div className="space-y-3">
                      {schedule.map((item) => (
                        <article key={`${item.patient}-${item.time}`} className="flex flex-col gap-4 rounded-2xl border border-[#dfe9e1] bg-white p-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="min-w-20 rounded-xl bg-[#edf5f0] px-3 py-2 text-center">
                              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#146c52]">Time</p>
                              <p className="mt-1 text-sm font-semibold text-[#17362c]">{item.time}</p>
                            </div>

                            <div>
                              <h4 className="text-lg font-semibold text-[#17362c]">{item.patient}</h4>
                              <p className="mt-1 text-sm text-[#587068]">{item.service} with {item.doctor}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 md:justify-end">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(item.status)}`}>
                              {item.status}
                            </span>
                            <button className="rounded-xl border border-[#b9cbbd] px-3 py-2 text-sm font-semibold text-[#17362c]">
                              View
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <aside className="space-y-6">
                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#146c52]">Clinic overview</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-2xl bg-[#eaf5ef] p-4">
                          <p className="text-2xl font-bold text-[#0d523e]">6</p>
                          <p className="text-xs uppercase tracking-[.12em] text-[#146c52]">Confirmed</p>
                        </div>
                        <div className="rounded-2xl bg-[#fff7e9] p-4">
                          <p className="text-2xl font-bold text-[#8a5e00]">2</p>
                          <p className="text-xs uppercase tracking-[.12em] text-[#8a5e00]">Waiting</p>
                        </div>
                        <div className="rounded-2xl bg-[#edf3ff] p-4">
                          <p className="text-2xl font-bold text-[#1f3d7a]">3</p>
                          <p className="text-xs uppercase tracking-[.12em] text-[#1f3d7a]">Completed</p>
                        </div>
                        <div className="rounded-2xl bg-[#fce9eb] p-4">
                          <p className="text-2xl font-bold text-[#8a1f2d]">1</p>
                          <p className="text-xs uppercase tracking-[.12em] text-[#8a1f2d]">Cancelled</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#146c52]">Next patient</p>
                      <div className="mt-4 rounded-2xl bg-[#eaf5ef] p-4">
                        <p className="text-xl font-semibold text-[#17362c]">Aarav Sharma</p>
                        <p className="mt-3 text-sm text-[#587068]">09:00 AM</p>
                        <span className="mt-4 inline-flex rounded-full bg-[#dff3e8] px-2.5 py-1 text-xs font-semibold text-[#0d523e]">
                          Confirmed
                        </span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#146c52]">Care team</p>
                      <ul className="mt-4 space-y-3 text-sm text-[#587068]">
                        <li className="flex items-center justify-between rounded-xl bg-[#f5f9f6] px-3 py-2">
                          <span>Dr. Ananya Rao</span>
                          <span className="text-[#146c52]">On duty</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl bg-[#f5f9f6] px-3 py-2">
                          <span>Reception</span>
                          <span className="text-[#146c52]">Available</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl bg-[#f5f9f6] px-3 py-2">
                          <span>Lab room</span>
                          <span className="text-[#146c52]">Ready</span>
                        </li>
                      </ul>
                    </div>
                  </aside>
                </div>
              </section>
            )}

            {screen === "appointments" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <form onSubmit={handleBookingSubmit} className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#146c52]">Booking</p>
                        <h3 className="mt-2 font-serif text-3xl">Create appointment</h3>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm font-semibold text-[#1f352f]">
                        Patient
                        <select
                          value={bookingForm.patient}
                          onChange={(event) => setBookingForm({ ...bookingForm, patient: event.target.value })}
                          className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
                        >
                          {patients.map((patient) => (
                            <option key={patient.name} value={patient.name}>{patient.name}</option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm font-semibold text-[#1f352f]">
                        Doctor
                        <select
                          value={bookingForm.doctor}
                          onChange={(event) => setBookingForm({ ...bookingForm, doctor: event.target.value })}
                          className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
                        >
                          {doctors.map((doctor) => (
                            <option key={doctor.name} value={doctor.name}>{doctor.name}</option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm font-semibold text-[#1f352f]">
                        Service
                        <select
                          value={bookingForm.service}
                          onChange={(event) => setBookingForm({ ...bookingForm, service: event.target.value })}
                          className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
                        >
                          <option value="Consultation">Consultation</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Check-up">Check-up</option>
                          <option value="Diagnostic">Diagnostic</option>
                        </select>
                      </label>

                      <label className="text-sm font-semibold text-[#1f352f]">
                        Time slot
                        <select
                          value={bookingForm.time}
                          onChange={(event) => setBookingForm({ ...bookingForm, time: event.target.value })}
                          className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
                        >
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="02:15 PM">02:15 PM</option>
                          <option value="03:30 PM">03:30 PM</option>
                        </select>
                      </label>
                    </div>

                    <label className="mt-4 block text-sm font-semibold text-[#1f352f]">
                      Preferred date
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(event) => setBookingForm({ ...bookingForm, date: event.target.value })}
                        className="mt-2 w-full border border-[#c7d5ca] bg-white px-3 py-3 text-[#17362c] outline-none"
                      />
                    </label>

                    <button className="mt-6 w-full bg-[#146c52] px-4 py-3 text-base font-semibold text-white hover:bg-[#0d523e]">
                      Confirm appointment
                    </button>
                  </form>

                  <aside className="space-y-6">
                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#146c52]">Available doctors</p>
                      <div className="mt-4 space-y-3">
                        {doctors.map((doctor) => (
                          <div key={doctor.name} className="rounded-2xl border border-[#dfe9e1] bg-white p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold text-[#17362c]">{doctor.name}</h4>
                              <span className="text-sm font-semibold text-[#146c52]">★ {doctor.rating}</span>
                            </div>
                            <p className="mt-1 text-sm text-[#587068]">{doctor.specialty}</p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-[.12em] text-[#146c52]">{doctor.availability}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#146c52]">Upcoming</p>
                      <div className="mt-4 space-y-3">
                        {schedule.slice(0, 3).map((item) => (
                          <div key={`${item.patient}-${item.time}`} className="rounded-2xl border border-[#dfe9e1] bg-white p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-[#17362c]">{item.patient}</p>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses(item.status)}`}>{item.status}</span>
                            </div>
                            <p className="mt-1 text-sm text-[#587068]">{item.doctor}</p>
                            <p className="mt-1 text-xs text-[#587068]">{item.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            )}

            {screen === "patients" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {patients.map((patient) => (
                    <div key={patient.name} className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-full bg-[#eaf5ef] text-lg font-bold text-[#146c52]">
                          {patient.name.slice(0, 1)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#17362c]">{patient.name}</h3>
                          <p className="text-xs uppercase tracking-[.12em] text-[#587068]">Patient</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-[#587068]">
                        <p>{patient.email}</p>
                        <p>{patient.phone}</p>
                        <p>Last visit: {patient.lastVisit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {screen === "doctors" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {doctors.map((doctor) => (
                    <div key={doctor.name} className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <div className="flex items-center justify-between">
                        <div className="grid size-12 place-items-center rounded-full bg-[#edf3ff] text-lg font-bold text-[#1f3d7a]">
                          {doctor.name.slice(0, 1)}
                        </div>
                        <span className="text-sm font-semibold text-[#146c52]">★ {doctor.rating}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-[#17362c]">{doctor.name}</h3>
                      <p className="mt-1 text-sm text-[#587068]">{doctor.specialty}</p>
                      <p className="mt-4 text-xs font-medium uppercase tracking-[.12em] text-[#146c52]">{doctor.availability}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(screen === "clinics" || screen === "availability" || screen === "billing" || screen === "settings") && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-8 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <h3 className="font-serif text-3xl text-[#17362c]">{activeMeta.title}</h3>
                  <p className="mt-3 text-[#587068]">{activeMeta.subtitle}</p>
                  <div className="mt-6 rounded-2xl border border-dashed border-[#bfd1c8] bg-[#f5faf7] p-8 text-center text-[#587068]">
                    This section is ready for the next module build-out.
                  </div>
                </div>
              </section>
            )}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
