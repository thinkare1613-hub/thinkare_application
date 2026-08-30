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
  { label: "Today", value: "24", tone: "bg-[#19b3a2] text-white" },
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
      <main className="min-h-screen bg-[#e8f1ee] text-[#17362c]">
        <section className="grid min-h-screen w-full lg:grid-cols-[1.08fr_0.92fr]">
          <div className="bg-[#19b3a2] px-8 pb-8 pt-10 text-white sm:px-12 lg:px-14 lg:pb-12 lg:pt-12">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/10 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
                  <path d="M12 21c4.5-2.7 7.5-6.2 7.5-10.8A4.7 4.7 0 0 0 14.8 5.5c-1.1 0-2.1.4-2.9 1.2A4.1 4.1 0 0 0 9 5.5 4.7 4.7 0 0 0 4.5 10.2C4.5 14.8 7.5 18.3 12 21Z" />
                  <path d="M10 10.5c.6-1 1.5-1.5 2.5-1.5 1.1 0 2 .6 2.5 1.5" />
                  <path d="M9 16.5h6" />
                </svg>
              </div>
              <span className="text-[2.1rem] font-bold tracking-[-0.04em]">ThidactorAI</span>
            </div>

            <div className="mt-16 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-lg font-medium text-white/95 shadow-sm backdrop-blur-sm">
              <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-white" />
              AI-Powered Healthcare Platform
            </div>

            <h1 className="mt-12 max-w-[620px] text-[4.2rem] font-bold leading-[0.96] tracking-[-0.06em] text-white">
              Global Healthcare at
              <span className="mt-2 block">Your Fingertips</span>
            </h1>

            <p className="mt-8 max-w-[620px] text-[1.25rem] leading-[1.6] text-white/90">
              Book appointments with verified doctors worldwide and manage your health records seamlessly.
            </p>

            <div className="mt-14 grid max-w-[560px] grid-cols-3 gap-4 text-white">
              <div>
                <div className="text-[3rem] font-bold tracking-[-0.06em]">500K+</div>
                <div className="mt-1 text-[1.03rem] text-white/85">Active Users</div>
              </div>
              <div>
                <div className="text-[3rem] font-bold tracking-[-0.06em]">50K+</div>
                <div className="mt-1 text-[1.03rem] text-white/85">Verified Doctors</div>
              </div>
              <div>
                <div className="text-[3rem] font-bold tracking-[-0.06em]">150+</div>
                <div className="mt-1 text-[1.03rem] text-white/85">Countries</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#f2f5f3] px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-[560px]">
              <h2 className="text-[3.2rem] font-bold tracking-[-0.06em] text-[#1d2d2a]">Welcome back</h2>
              <p className="mt-3 text-[1.15rem] text-[#5c6664]">Sign in to access your health dashboard</p>

              <form onSubmit={login} className="mt-8">
                <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                  Email address
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
                      <path d="m5 7 7 5 7-5" />
                    </svg>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                    />
                  </div>
                </label>

                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <label className="text-[1.05rem] font-medium text-[#2b3d3a]">Password</label>
                    <button type="button" className="text-[1.02rem] font-medium text-[#19b3a2] hover:text-[#118f88]">
                      Forgot password?
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                      <rect x="5" y="10" width="14" height="9" rx="2" />
                    </svg>
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      type="password"
                      placeholder="Enter your password"
                      className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                    />
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </div>

                <label className="mt-6 flex items-center gap-3 text-[1rem] text-[#2b3d3a]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#cbd6d2] accent-[#19b3a2]" />
                  Remember me for 30 days
                </label>

                <button
                  type="submit"
                  className="mt-8 w-full rounded-xl bg-[#19b3a2] py-4 text-[1.1rem] font-bold text-white shadow-[0_12px_25px_rgba(25,179,162,0.28)] hover:bg-[#14a191]"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-9 flex items-center gap-4 text-[#5c6664]">
                <div className="h-px flex-1 bg-[#cbd7d3]" />
                <span className="text-[0.88rem] font-medium uppercase tracking-[0.2em]">or continue with</span>
                <div className="h-px flex-1 bg-[#cbd7d3]" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-[#d6e0db] bg-[#ffffff] px-4 py-3 text-lg font-semibold text-[#1d2d2a] shadow-sm hover:bg-[#f7faf9]">
                  <span className="text-2xl">G</span>
                  <span>Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-[#d6e0db] bg-[#ffffff] px-4 py-3 text-lg font-semibold text-[#1d2d2a] shadow-sm hover:bg-[#f7faf9]">
                  <span className="text-2xl"></span>
                  <span>Apple</span>
                </button>
              </div>

              <p className="mt-8 text-center text-[1.03rem] text-[#5c6664]">
                Don&apos;t have an account? <button type="button" className="font-semibold text-[#19b3a2] hover:text-[#118f88]">Get Started</button>
              </p>
            </div>
          </div>
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
                    <p className="text-sm font-bold uppercase tracking-[.14em] text-[#19b3a2]">Monday, 30 August</p>
                    <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Clinic operations dashboard</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        className={
                          action.startsWith("+")
                            ? "rounded-xl bg-[#19b3a2] px-4 py-2.5 text-sm font-semibold text-white"
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
                        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Today's schedule</p>
                        <h3 className="mt-2 font-serif text-2xl">Appointments</h3>
                      </div>
                      <button className="text-sm font-semibold text-[#19b3a2]">View all</button>
                    </div>

                    <div className="space-y-3">
                      {schedule.map((item) => (
                        <article key={`${item.patient}-${item.time}`} className="flex flex-col gap-4 rounded-2xl border border-[#dfe9e1] bg-white p-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="min-w-20 rounded-xl bg-[#eaf9f7] px-3 py-2 text-center">
                              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">Time</p>
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
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Clinic overview</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-2xl bg-[#eaf5ef] p-4">
                          <p className="text-2xl font-bold text-[#0d523e]">6</p>
                          <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Confirmed</p>
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
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Next patient</p>
                      <div className="mt-4 rounded-2xl bg-[#eaf5ef] p-4">
                        <p className="text-xl font-semibold text-[#17362c]">Aarav Sharma</p>
                        <p className="mt-3 text-sm text-[#587068]">09:00 AM</p>
                        <span className="mt-4 inline-flex rounded-full bg-[#dff3e8] px-2.5 py-1 text-xs font-semibold text-[#0d523e]">
                          Confirmed
                        </span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Care team</p>
                      <ul className="mt-4 space-y-3 text-sm text-[#587068]">
                        <li className="flex items-center justify-between rounded-xl bg-[#f5f9f6] px-3 py-2">
                          <span>Dr. Ananya Rao</span>
                          <span className="text-[#19b3a2]">On duty</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl bg-[#f5f9f6] px-3 py-2">
                          <span>Reception</span>
                          <span className="text-[#19b3a2]">Available</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl bg-[#f5f9f6] px-3 py-2">
                          <span>Lab room</span>
                          <span className="text-[#19b3a2]">Ready</span>
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
                        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Booking</p>
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

                    <button className="mt-6 w-full bg-[#19b3a2] px-4 py-3 text-base font-semibold text-white hover:bg-[#149d92]">
                      Confirm appointment
                    </button>
                  </form>

                  <aside className="space-y-6">
                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Available doctors</p>
                      <div className="mt-4 space-y-3">
                        {doctors.map((doctor) => (
                          <div key={doctor.name} className="rounded-2xl border border-[#dfe9e1] bg-white p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold text-[#17362c]">{doctor.name}</h4>
                              <span className="text-sm font-semibold text-[#19b3a2]">★ {doctor.rating}</span>
                            </div>
                            <p className="mt-1 text-sm text-[#587068]">{doctor.specialty}</p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-[.12em] text-[#19b3a2]">{doctor.availability}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Upcoming</p>
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
                        <div className="grid size-11 place-items-center rounded-full bg-[#eaf9f7] text-lg font-bold text-[#19b3a2]">
                          {patient.name.slice(0, 1)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#17362c]">{patient.name}</h3>
                          <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Patient</p>
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
                        <div className="grid size-12 place-items-center rounded-full bg-[#eaf9f7] text-lg font-bold text-[#19b3a2]">
                          {doctor.name.slice(0, 1)}
                        </div>
                        <span className="text-sm font-semibold text-[#19b3a2]">★ {doctor.rating}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-[#17362c]">{doctor.name}</h3>
                      <p className="mt-1 text-sm text-[#587068]">{doctor.specialty}</p>
                      <p className="mt-4 text-xs font-medium uppercase tracking-[.12em] text-[#19b3a2]">{doctor.availability}</p>
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
