import { CalendarDays, ClipboardList, Clock3, UserPlus } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

type AppointmentStatus = "Confirmed" | "Waiting" | "In progress" | "Completed" | "Cancelled";

type Appointment = {
  date?: string;
  time: string;
  patient: string;
  doctor: string;
  service: string;
  status: AppointmentStatus;
};

type Doctor = {
  name: string;
  specialization: string;
  availability: string;
};

type Patient = {
  name: string;
  lastVisit: string;
};

type MedicationReminder = {
  patient: string;
  medicine: string;
  dose: string;
  time: string;
  note: string;
};

type ClinicDashboardProps = {
  userName: string;
  clinicName: string;
  schedule: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  clinicBookingUrl: string;
  isLocalBookingUrl: boolean;
  onOpenAppointments: () => void;
  onOpenPatients: () => void;
  onOpenDoctors: () => void;
  onOpenClinics: () => void;
  onOpenAvailability: () => void;
};

const statusStyles: Record<AppointmentStatus, string> = {
  Confirmed: "bg-[#dcf7ee] text-[#0d7c5a]",
  Waiting: "bg-[#fff0cf] text-[#9c6a00]",
  "In progress": "bg-[#e5efff] text-[#2b61d1]",
  Completed: "bg-[#e8f6ff] text-[#1f6d9c]",
  Cancelled: "bg-[#fde5e8] text-[#a33a48]",
};

function badge(status: AppointmentStatus) {
  return statusStyles[status] ?? "bg-[#edf3ff] text-[#1f3d7a]";
}

function ActionButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-[#dfe9e1] bg-white p-3 text-left text-sm font-semibold text-[#17362c]">
      <span className="flex items-center gap-2">
        <span className="text-[#19b3a2]">{icon}</span>
        {label}
      </span>
    </button>
  );
}

export function ClinicDashboard({
  userName,
  clinicName,
  schedule,
  doctors,
  patients,
  clinicBookingUrl,
  isLocalBookingUrl,
  onOpenAppointments,
  onOpenPatients,
  onOpenDoctors,
  onOpenClinics,
  onOpenAvailability,
}: ClinicDashboardProps) {
  const demoSchedule: Appointment[] = schedule.length > 0 ? schedule : [
    { date: "Today", time: "09:00 AM", patient: "Aarav Mehta", doctor: "Dr. Ananya Rao", service: "Consultation", status: "Confirmed" },
    { date: "Today", time: "10:30 AM", patient: "Meera Shah", doctor: "Dr. Ananya Rao", service: "Follow-up", status: "Waiting" },
    { date: "Today", time: "12:00 PM", patient: "Kabir Singh", doctor: "Dr. Rohit Patel", service: "Check-up", status: "In progress" },
    { date: "Today", time: "02:15 PM", patient: "Sara Khan", doctor: "Dr. Nisha Iyer", service: "Diagnostic", status: "Completed" },
  ];
  const demoDoctors: Doctor[] = doctors.length > 0 ? doctors : [
    { name: "Dr. Ananya Rao", specialization: "Cardiology", availability: "Available today" },
    { name: "Dr. Rohit Patel", specialization: "General Medicine", availability: "Next slot 11:00 AM" },
    { name: "Dr. Nisha Iyer", specialization: "Pediatrics", availability: "Available tomorrow" },
  ];
  const demoPatients: Patient[] = patients.length > 0 ? patients : [
    { name: "Aarav Mehta", lastVisit: "Today" },
    { name: "Meera Shah", lastVisit: "Yesterday" },
    { name: "Kabir Singh", lastVisit: "3 days ago" },
  ];
  const demoMedicationReminders: MedicationReminder[] = [
    { patient: "Bhavani Patient", medicine: "Amlodipine", dose: "5 mg", time: "8:00 AM", note: "Take after breakfast" },
    { patient: "Aarav Mehta", medicine: "Vitamin D3", dose: "60,000 IU", time: "2:00 PM", note: "Weekly reminder enabled" },
    { patient: "Meera Shah", medicine: "Metformin", dose: "500 mg", time: "8:30 PM", note: "With dinner" },
  ];
  const todayBookings = demoSchedule.length;
  const completedToday = demoSchedule.filter((item) => item.status === "Completed").length;
  const waitingToday = demoSchedule.filter((item) => item.status === "Waiting").length;
  const nextPatient = demoSchedule[0];
  const bookingUrl = clinicBookingUrl || `${window.location.origin}/clinic/${clinicName.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
      <div className="mb-6 border-b border-[#d8e2d9] pb-6">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-[#19b3a2]">{clinicName}</p>
        <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[#17362c] sm:text-5xl">Welcome back, {userName}</h2>
        <p className="mt-2 text-sm text-[#587068]">Keep this screen close to the appointment booking reference.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Today&apos;s bookings" value={todayBookings.toString()} note="AI can answer this instantly" tone="mint" />
        <InfoCard label="Waiting now" value={waitingToday.toString()} note="Need confirmation or triage" tone="amber" />
        <InfoCard label="Completed" value={completedToday.toString()} note={nextPatient ? `Next patient: ${nextPatient.patient}` : "No bookings yet"} tone="blue" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#bfd7cd] bg-[linear-gradient(135deg,#f6fbf8_0%,#edf8f3_100%)] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
            <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">AI booking assistant</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#17362c]">Let AI find the best appointment for your patient</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#587068]">Select a patient and doctor to let the assistant recommend the best available booking path and keep medicine-time reminders in view.</p>
            <button type="button" onClick={onOpenAppointments} className="mt-4 rounded-2xl bg-[#19b3a2] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(25,179,162,0.2)]">
              Use AI recommendation
            </button>
            <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#19b3a2]">Try asking AI</p>
              <p className="mt-1 text-sm text-[#17362c]">How many bookings today, which doctor is next, and when is the next medicine reminder?</p>
            </div>
          </section>

          <section className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Appointment booking</p>

            <section className="mt-6 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">AI medicine reminders</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#17362c]">AI maintains medicine time for your patients</h3>
                </div>
                <button type="button" onClick={onOpenPatients} className="text-sm font-semibold text-[#19b3a2]">View patients</button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {demoMedicationReminders.map((reminder) => (
                  <div key={`${reminder.patient}-${reminder.medicine}`} className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#17362c]">{reminder.patient}</p>
                        <p className="mt-1 text-sm text-[#587068]">{reminder.medicine} · {reminder.dose}</p>
                      </div>
                      <span className="rounded-full bg-[#eaf9f7] px-2.5 py-1 text-[10px] font-semibold text-[#19b3a2]">{reminder.time}</span>
                    </div>
                    <p className="mt-3 text-sm text-[#587068]">{reminder.note}</p>
                  </div>
                ))}
              </div>
            </section>
                <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#17362c]">Schedule an appointment</h3>
                <p className="mt-2 text-sm leading-6 text-[#587068]">Select a patient, doctor, service, date, and available time slot.</p>
              </div>
              <button type="button" onClick={onOpenAppointments} className="text-sm font-semibold text-[#19b3a2]">
                View all
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {demoSchedule.slice(0, 4).map((item) => (
                <div key={`${item.patient}-${item.time}`} className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#17362c]">{item.patient}</p>
                      <p className="mt-1 text-sm text-[#587068]">{item.service}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${badge(item.status)}`}>{item.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#587068]">
                    <span>{item.doctor}</span>
                    <span>{item.date ?? "Today"} · {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Available doctors</p>
                <h3 className="mt-1 text-lg font-bold text-[#17362c]">Available doctors</h3>
              </div>
              <button type="button" onClick={onOpenDoctors} className="text-sm font-semibold text-[#19b3a2]">
                View all
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {demoDoctors.slice(0, 3).map((doctor) => (
                <div key={doctor.name} className="rounded-2xl border border-[#dfe9e1] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold text-[#17362c]">{doctor.name}</h4>
                    <span className="text-sm font-semibold text-[#19b3a2]">Book</span>
                  </div>
                  <p className="mt-1 text-sm text-[#587068]">{doctor.specialization}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[.12em] text-[#19b3a2]">{doctor.availability}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
            <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Upcoming</p>
            <div className="mt-4 space-y-3">
              {demoSchedule.slice(0, 3).map((item) => (
                <div key={`${item.patient}-${item.time}`} className="rounded-2xl border border-[#dfe9e1] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#17362c]">{item.patient}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${badge(item.status)}`}>{item.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#587068]">{item.doctor}</p>
                  <p className="mt-1 text-xs text-[#587068]">{item.time}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
            <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Clinic booking QR</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid size-24 place-items-center rounded-2xl border border-[#dfe9e1] bg-white p-2 shadow-[0_10px_24px_rgba(20,108,82,0.08)]">
                <QRCodeCanvas value={bookingUrl} size={88} bgColor="#ffffff" fgColor="#17362c" level="M" includeMargin={false} />
              </div>
              <div className="min-w-0 flex-1 text-sm text-[#587068]">
                <p>Scan to book appointment</p>
                <p className="mt-1 break-all text-[#17362c]">{bookingUrl}</p>
              </div>
            </div>
            {isLocalBookingUrl && <p className="mt-3 text-xs text-[#7a2222]">Local URL detected. Use a reachable LAN or deployed URL.</p>}
          </section>

          <section className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
            <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Quick actions</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ActionButton label="New Appointment" icon={<CalendarDays className="size-4" />} onClick={onOpenAppointments} />
              <ActionButton label="Add Patient" icon={<UserPlus className="size-4" />} onClick={onOpenPatients} />
              <ActionButton label="Doctors" icon={<ClipboardList className="size-4" />} onClick={onOpenDoctors} />
              <ActionButton label="Availability" icon={<Clock3 className="size-4" />} onClick={onOpenAvailability} />
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Patient snapshot</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {demoPatients.slice(0, 3).map((patient) => (
            <div key={patient.name} className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
              <p className="font-semibold text-[#17362c]">{patient.name}</p>
              <p className="mt-1 text-sm text-[#587068]">Last visit: {patient.lastVisit}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={onOpenClinics} className="mt-4 text-sm font-semibold text-[#19b3a2]">
          Clinic settings
        </button>
      </section>
    </section>
  );
}

function InfoCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: "mint" | "amber" | "blue" }) {
  const toneClasses = {
    mint: "bg-[#eafaf6] text-[#0d7c5a]",
    amber: "bg-[#fff4df] text-[#9c6a00]",
    blue: "bg-[#edf4ff] text-[#2563eb]",
  };

  return (
    <article className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#587068]">{label}</p>
      <div className={`mt-3 inline-flex items-center rounded-2xl px-4 py-2 text-3xl font-bold tracking-[-0.04em] ${toneClasses[tone]}`}>{value}</div>
      <p className="mt-3 text-sm text-[#587068]">{note}</p>
    </article>
  );
}