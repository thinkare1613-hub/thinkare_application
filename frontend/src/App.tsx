import { useState } from "react";
import type { FormEvent } from "react";

type Screen = "login" | "dashboard" | "storyboard";

const appointments = [
  ["09:00", "Aarav Sharma", "Consultation", "Confirmed"],
  ["10:30", "Meera Iyer", "Follow-up", "Confirmed"],
  ["12:00", "Kabir Khan", "Consultation", "Pending"],
];

const story = [
  ["Find care", "Patient searches specialties, doctors, and clinics."],
  ["Choose a time", "Available slots show only when a doctor is working."],
  ["Confirm visit", "A unique slot is reserved and the patient is notified."],
  ["Clinic day", "Staff check in patients and track appointments."],
];

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Sign in failed");
      setMessage(`Welcome back, ${email.split("@")[0] || "clinic admin"}.`);
      setScreen("dashboard");
    } catch {
      setMessage("Unable to sign in. Confirm the FastAPI backend is running.");
    }
  }

  if (screen === "login") {
    return <main className="min-h-screen bg-[#e9f0eb] p-5 text-[#17362c] lg:grid lg:place-items-center"><section className="grid w-full max-w-5xl overflow-hidden border border-[#c7d5ca] bg-[#fcfdf9] shadow-[0_18px_60px_rgba(23,54,44,.13)] lg:grid-cols-[1.05fr_.95fr]"><div className="bg-[#146c52] p-8 text-white sm:p-12"><p className="text-xs font-bold tracking-[.18em] text-[#bfe0ca]">THINKARE</p><h1 className="mt-10 font-serif text-5xl leading-[1.02]">Care starts with a clear day.</h1><p className="mt-6 max-w-sm text-[#d3e8da]">Appointments, availability, and patient flow for clinics that want less friction.</p></div><form onSubmit={login} className="p-8 sm:p-12"><p className="text-sm font-bold tracking-[.12em] text-[#146c52]">CLINIC PORTAL</p><h2 className="mt-3 font-serif text-4xl">Welcome back</h2><p className="mt-3 text-[#587068]">Sign in to manage today&apos;s care.</p><label className="mt-9 block text-sm font-semibold">Email<input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="you@clinic.com" className="mt-2 w-full border border-[#b9cbbd] bg-white px-3 py-3 font-normal outline-none focus:border-[#146c52]" /></label><label className="mt-5 block text-sm font-semibold">Password<input required name="password" type="password" placeholder="Enter password" className="mt-2 w-full border border-[#b9cbbd] bg-white px-3 py-3 font-normal outline-none focus:border-[#146c52]" /></label><button className="mt-7 w-full bg-[#146c52] py-3 font-semibold text-white hover:bg-[#0d523e]">Sign in</button><button type="button" onClick={() => setScreen("storyboard")} className="mt-5 text-sm font-semibold text-[#146c52]">View product storyboard</button></form></section></main>;
  }

  return <main className="min-h-screen bg-[#f3f6f3] text-[#17362c]"><header className="border-b border-[#d8e2d9] bg-[#fcfdf9]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><button onClick={() => setScreen("dashboard")} className="flex items-center gap-3 text-left"><b className="grid size-10 place-items-center bg-[#146c52] text-lg text-white">T</b><span><strong className="block font-serif text-xl">Thinkare</strong><small className="text-xs tracking-[.12em] text-[#527064]">CARE, MADE CLEAR</small></span></button><nav className="flex items-center gap-5 text-sm font-semibold"><button onClick={() => setScreen("storyboard")} className="text-[#146c52]">Storyboard</button><button onClick={() => setScreen("login")} className="border border-[#b9cbbd] px-3 py-2">Sign out</button></nav></div></header>{screen === "storyboard" ? <section className="mx-auto max-w-7xl px-5 py-10"><p className="text-sm font-bold tracking-[.12em] text-[#146c52]">PRODUCT STORYBOARD</p><h1 className="mt-3 max-w-2xl font-serif text-4xl sm:text-5xl">From finding a doctor to a completed visit.</h1><div className="mt-10 grid gap-px bg-[#c7d5ca] md:grid-cols-2">{story.map(([title, description], index) => <article key={title} className="min-h-52 bg-[#fcfdf9] p-7"><span className="font-serif text-5xl text-[#8abda1]">0{index + 1}</span><h2 className="mt-8 font-serif text-2xl">{title}</h2><p className="mt-3 max-w-sm text-[#587068]">{description}</p></article>)}</div></section> : <section className="mx-auto max-w-7xl px-5 py-10"><div className="border-b border-[#d8e2d9] pb-8"><p className="text-sm font-bold text-[#146c52]">MONDAY, 30 AUGUST</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Today&apos;s appointments</h1><p className="mt-3 text-[#587068]">Keep the clinic day moving with a clear, shared view of patient care.</p></div>{message && <p className="mt-6 border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm text-[#0d523e]">{message}</p>}<div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]"><section><h2 className="mb-4 font-serif text-2xl">Schedule</h2><div className="border border-[#d8e2d9] bg-[#fcfdf9]">{appointments.map(([time, patient, type, status]) => <article key={time} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-b border-[#e2e9e3] px-5 py-5"><time className="font-mono text-sm font-bold text-[#146c52]">{time}</time><div><h3 className="font-semibold">{patient}</h3><p className="text-sm text-[#587068]">{type} with Dr. Ananya Rao</p></div><span className="text-xs font-bold text-[#146c52]">{status}</span></article>)}</div></section><aside className="bg-[#146c52] p-6 text-white"><p className="text-xs font-bold tracking-[.14em] text-[#b8dcc8]">CLINIC OVERVIEW</p><h2 className="mt-3 font-serif text-3xl">A calmer clinic day.</h2><dl className="mt-8 space-y-5 border-t border-[#4a967b] pt-6"><div className="flex justify-between"><dt>Confirmed</dt><dd>6</dd></div><div className="flex justify-between"><dt>Waiting</dt><dd>2</dd></div><div className="flex justify-between"><dt>Next patient</dt><dd>Aarav, 09:00</dd></div></dl></aside></div></section>}</main>;
}

export default App;