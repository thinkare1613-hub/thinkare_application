import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BadgeCheck, Bell, CalendarDays, Check, CreditCard, LayoutGrid, Sparkles, Stethoscope, Users } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { validatePatientDoctorClinicMatch } from "./clinicValidation";
import { LoginPage } from "./pages/auth/LoginPage";
import { CreateClinicAccountPage } from "./pages/auth/CreateClinicAccountPage";
import { MedicalRecordsPage } from "./components/medical-records/MedicalRecordsPage";
import { AppointmentForm } from "./components/appointments/AppointmentForm";
import { BillingPage } from "./components/billing/BillingPage";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import { ShowcasePage } from "./components/ShowcasePage";

type Screen = "login" | "register" | "showcase" | "dashboard" | "payments" | "care_team" | "appointments" | "medical_records" | "prescriptions" | "patients" | "doctors" | "clinics" | "availability" | "billing" | "notifications" | "profile";
type AuthMode = "clinic_admin" | "patient";
type UserRole = "clinic_admin" | "platform_admin" | "doctor" | "patient";

type Appointment = {
  id?: string;
  date?: string;
  time: string;
  patient: string;
  doctor: string;
  service: string;
  status: "Confirmed" | "Waiting" | "In progress" | "Completed" | "Cancelled";
};

type Doctor = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  experience: string;
  profilePhoto: string;
  consultationFee: number;
  status: "Available" | "On leave" | "Booked";
  availability: string;
  rating: number;
  clinicId?: string;
};

type Patient = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  clinicId?: string;
};

type AIContext = {
  screen: Screen;
  role: UserRole;
  clinicId: string;
  summary: string;
  signals: string[];
  suggestedActions: string[];
  confidence: "low" | "medium" | "high";
  requiresApproval: boolean;
  recommendedDoctorName?: string;
  recommendedDoctorId?: string;
  recommendedDate?: string;
  patientName?: string;
  rankedDoctors?: Array<{ id: string; name: string; workload: number; patientHistory: number; score: number }>;
};

const pageMeta: Record<Exclude<Screen, "login" | "register">, { title: string; subtitle: string }> = {
  showcase: { title: "Showcase", subtitle: "A guided view of the AI-native experience across roles and devices." },
  dashboard: { title: "Dashboard", subtitle: "Overview of patient flow and clinic performance." },
  payments: { title: "Payments", subtitle: "Subscription payment monitoring across clinics." },
  care_team: { title: "My Doctor / Care Team", subtitle: "View your assigned clinician and care team." },
  appointments: { title: "Appointments", subtitle: "Track visits, check-in status, and upcoming time slots." },
  medical_records: { title: "Medical Records", subtitle: "Access your recent reports, summaries, and visit history." },
  prescriptions: { title: "Prescriptions", subtitle: "Review active medicines and refill information." },
  patients: { title: "Patients", subtitle: "View patient history, records, and follow-up plans." },
  doctors: { title: "Doctors", subtitle: "Team coverage, schedules, and consultation workloads." },
  clinics: { title: "Clinics", subtitle: "Manage locations, capacity, and operational coverage." },
  availability: { title: "Availability", subtitle: "Control schedules, working hours, and open slots." },
  billing: { title: "Billing", subtitle: "Review payments, outstanding balances, and invoices." },
  notifications: { title: "Notifications", subtitle: "Stay updated on reminders, follow-ups, and care alerts." },
  profile: { title: "Profile", subtitle: "Manage your personal details and preferences." },
};

const currentHostUrl = `${window.location.protocol}//${window.location.hostname}`;
const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(window.location.hostname);
const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const productionApiUrl = "https://thinkare-application-1.onrender.com";
const apiUrl = configuredApiUrl && (!window.location.protocol.startsWith("https:") || !configuredApiUrl.startsWith("http://"))
  ? configuredApiUrl
  : isLocalHost
    ? `${currentHostUrl}:8000`
    : productionApiUrl;
const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL ?? `${currentHostUrl}:5173`).replace(/\/$/, "");

type ClinicProfile = {
  id: string;
  name: string;
  admin: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  publicSlug: string;
};

const emptyClinicProfile: ClinicProfile = {
  id: "",
  name: "",
  admin: "",
  email: "",
  phone: "",
  address: "",
  logo: "",
  publicSlug: "",
};

type StoredSession = {
  accessToken: string;
  currentUserRole: UserRole;
  authMode: AuthMode;
  clinicProfile: ClinicProfile;
  screen: Screen;
};

const sessionStorageKey = "thinkare.web.session";
const currentClinicSlug = window.location.pathname.match(/^\/clinic\/([^/]+)$/)?.[1] ?? "";

function readStoredSession(): StoredSession | null {
  try {
    const rawSession = window.localStorage.getItem(sessionStorageKey);
    if (!rawSession) return null;
    const parsed = JSON.parse(rawSession) as Partial<StoredSession>;
    if (!parsed.accessToken || !parsed.currentUserRole || !parsed.authMode || !parsed.clinicProfile) return null;
    return {
      accessToken: String(parsed.accessToken),
      currentUserRole: parsed.currentUserRole as UserRole,
      authMode: parsed.authMode as AuthMode,
      clinicProfile: parsed.clinicProfile as ClinicProfile,
      screen: parsed.screen as Screen || "dashboard",
    };
  } catch {
    return null;
  }
}

const storedSession = readStoredSession();
const canReuseStoredSession = Boolean(
  storedSession?.accessToken && (!currentClinicSlug || storedSession.clinicProfile.publicSlug === currentClinicSlug),
);
const initialScreen: Screen = canReuseStoredSession ? (storedSession?.screen && storedSession.screen !== "login" && storedSession.screen !== "register" ? storedSession.screen : "dashboard") : "login";

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
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [authMode, setAuthMode] = useState<AuthMode>(canReuseStoredSession ? storedSession!.authMode : currentClinicSlug ? "patient" : "clinic_admin");
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(canReuseStoredSession ? storedSession!.currentUserRole : "clinic_admin");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isPatientRegistration, setIsPatientRegistration] = useState(Boolean(currentClinicSlug));
  const [clinicName, setClinicName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>(canReuseStoredSession ? storedSession!.clinicProfile : emptyClinicProfile);
  const [accessToken, setAccessToken] = useState(canReuseStoredSession ? storedSession!.accessToken : "");
  const [aiContext, setAiContext] = useState<AIContext | null>(null);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [schedule, setSchedule] = useState<Appointment[]>([]);
  const [availableSlotOptions, setAvailableSlotOptions] = useState<string[]>([]);
  const [bookingForm, setBookingForm] = useState({
    patient: "",
    doctor: "",
    service: "",
    date: "",
    time: "",
  });
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "Cardiology",
    qualification: "MD (Cardiology)",
    licenseNumber: "",
    experience: "5 years",
    profilePhoto: "DR",
    consultationFee: 800,
    status: "Available" as Doctor["status"],
    availability: "Available today",
    rating: 4.8,
  });
  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    email: "",
    phone: "",
    lastVisit: "Today",
    doctor: "",
  });

  useEffect(() => {
    const clinicSlug = window.location.pathname.match(/^\/clinic\/([^/]+)$/)?.[1];
    if (!clinicSlug) return;
    if (canReuseStoredSession) return;

    fetch(`${apiUrl}/api/public/clinics/${encodeURIComponent(clinicSlug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Clinic booking page not found");
        return response.json();
      })
      .then((clinic) => {
        setClinicProfile((current) => ({
          ...current,
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          logo: clinic.name.slice(0, 2).toUpperCase(),
          publicSlug: clinicSlug,
        }));
        setAuthMode("patient");
        setIsPatientRegistration(true);
        setScreen("login");
        setMessage(`Welcome to ${clinic.name}. Sign in with your mobile number to book an appointment.`);
      })
      .catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      window.localStorage.removeItem(sessionStorageKey);
      return;
    }

    window.localStorage.setItem(
      sessionStorageKey,
      JSON.stringify({ accessToken, currentUserRole, authMode, clinicProfile, screen }),
    );
  }, [accessToken, currentUserRole, authMode, clinicProfile, screen]);

  const selectedPatient = patientList.find((entry) => entry.name === selectedPatientName) ?? patientList[0];
  const assignedDoctorsForCurrentPatient = doctorList;

  const eligibleDoctors = useMemo(() => {
    if (!selectedPatient) {
      return doctorList;
    }

    if (currentUserRole === "patient") {
      return assignedDoctorsForCurrentPatient;
    }

    return doctorList.filter((doctor) => doctor.clinicId === selectedPatient.clinicId || !doctor.clinicId || !selectedPatient.clinicId);
  }, [assignedDoctorsForCurrentPatient, currentUserRole, doctorList, selectedPatient]);

  const visiblePatients = useMemo(() => {
    return patientList;
  }, [patientList]);

  const selectedBookingDoctor = useMemo(
    () => doctorList.find((doctor) => doctor.name === bookingForm.doctor) ?? null,
    [bookingForm.doctor, doctorList],
  );

  const recommendedPatient = useMemo(() => {
    if (!visiblePatients.length) return null;
    return visiblePatients.find((patient) => !schedule.some((item) => item.patient === patient.name)) ?? visiblePatients[0];
  }, [schedule, visiblePatients]);

  const appointmentContextPatientName = bookingForm.patient || selectedPatientName || recommendedPatient?.name || "";
  const appointmentAiDoctorName = aiContext?.recommendedDoctorName || eligibleDoctors[0]?.name || doctorList[0]?.name || "";
  const appointmentAiDate = aiContext?.recommendedDate || bookingForm.date || new Date().toISOString().slice(0, 10);
  const appointmentAiSlot = availableSlotOptions[0] || bookingForm.time || "";

  useEffect(() => {
    if (!accessToken || currentUserRole === "platform_admin") return;

    const headers = { Authorization: `Bearer ${accessToken}` };
    const loadClinicData = () => Promise.all([
        fetch(`${apiUrl}/api/doctors`, { headers }),
        fetch(`${apiUrl}/api/patients`, { headers }),
        fetch(`${apiUrl}/api/appointments`, { headers }),
      ])
      .then(async ([doctorsResponse, patientsResponse, appointmentsResponse]) => {
        if (!doctorsResponse.ok || !patientsResponse.ok || !appointmentsResponse.ok) {
          throw new Error("Unable to load clinic data.");
        }
        const [doctors, patients, appointments] = await Promise.all([
          doctorsResponse.json(),
          patientsResponse.json(),
          appointmentsResponse.json(),
        ]);
        setDoctorList(doctors.map((doctor: Record<string, unknown>) => ({
          id: String(doctor.id), name: String(doctor.name ?? ""), email: String(doctor.email ?? ""),
          phone: String(doctor.phone ?? ""), specialization: String(doctor.specialization ?? "General Medicine"),
          qualification: String(doctor.qualification ?? ""), licenseNumber: String(doctor.license_number ?? ""),
          experience: String(doctor.experience ?? doctor.experience_years ?? ""), profilePhoto: String(doctor.profile_photo ?? ""),
          consultationFee: Number(doctor.consultation_fee ?? 0), status: doctor.status === "Booked" || doctor.status === "On leave" ? doctor.status : "Available",
          availability: String(doctor.availability ?? ""), rating: Number(doctor.rating ?? 0), clinicId: String(doctor.clinic_id ?? ""),
        })));
        setPatientList(patients.map((patient: Record<string, unknown>) => ({
          id: String(patient.id), name: String(patient.name ?? ""), email: String(patient.email ?? ""),
          phone: String(patient.phone ?? ""), lastVisit: String(patient.last_visit ?? "No visits yet"), clinicId: String(patient.clinic_id ?? ""),
        })));
        setSchedule(appointments as Appointment[]);
      })
      .catch((error: Error) => setMessage(error.message));

    void loadClinicData();
    const refreshInterval = window.setInterval(() => void loadClinicData(), 20_000);
    return () => window.clearInterval(refreshInterval);
  }, [accessToken, currentUserRole]);

  useEffect(() => {
    if (!accessToken || currentUserRole === "platform_admin" || screen === "login" || screen === "register") {
      setAiContext(null);
      return;
    }

    const controller = new AbortController();
    const aiContextUrl = new URL(`${apiUrl}/api/ai/context`);
    aiContextUrl.searchParams.set("screen", screen);
    if (screen === "appointments" && appointmentContextPatientName) {
      aiContextUrl.searchParams.set("patient_name", appointmentContextPatientName);
    }

    fetch(aiContextUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("AI context unavailable");
        }
        return response.json();
      })
      .then((context: Record<string, unknown>) => {
        const recommendedDoctor = context.recommended_doctor as Record<string, unknown> | null | undefined;
        setAiContext({
          screen: String(context.screen ?? screen) as Screen,
          role: String(context.role ?? currentUserRole) as UserRole,
          clinicId: String(context.clinic_id ?? clinicProfile.id ?? ""),
          summary: String(context.summary ?? ""),
          signals: Array.isArray(context.signals) ? context.signals.map((signal) => String(signal)) : [],
          suggestedActions: Array.isArray(context.suggested_actions)
            ? context.suggested_actions.map((action) => String(action))
            : [],
          confidence: String(context.confidence ?? "medium") as AIContext["confidence"],
          requiresApproval: Boolean(context.requires_approval),
          recommendedDoctorName: String(recommendedDoctor?.name ?? ""),
          recommendedDoctorId: String(recommendedDoctor?.id ?? ""),
          recommendedDate: String(context.recommended_date ?? ""),
          patientName: String(context.patient_name ?? ""),
          rankedDoctors: Array.isArray(context.ranked_doctors)
            ? context.ranked_doctors.map((doctor) => ({
                id: String(doctor.id ?? ""),
                name: String(doctor.name ?? ""),
                workload: Number(doctor.workload ?? 0),
                patientHistory: Number(doctor.patient_history ?? 0),
                score: Number(doctor.score ?? 0),
              }))
            : [],
        });
      })
      .catch(() => setAiContext(null));

    return () => controller.abort();
  }, [accessToken, appointmentContextPatientName, currentUserRole, screen]);

  useEffect(() => {
    if (screen !== "appointments" || currentUserRole === "patient" || !accessToken || !selectedBookingDoctor?.id || !bookingForm.date) {
      setAvailableSlotOptions([]);
      return;
    }

    const controller = new AbortController();
    fetch(
      `${apiUrl}/api/slots?doctor_id=${encodeURIComponent(selectedBookingDoctor.id)}&slot_date=${encodeURIComponent(bookingForm.date)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load available slots.");
        }

        return response.json();
      })
      .then((slots: Array<{ start_time?: string }>) => {
        const options = slots.map((slot) => String(slot.start_time ?? "")).filter(Boolean);
        setAvailableSlotOptions(options);
        setBookingForm((current) =>
          options.length && !options.includes(current.time)
            ? { ...current, time: options[0] }
            : current,
        );
      })
      .catch(() => {
        setAvailableSlotOptions([]);
      });

    return () => controller.abort();
  }, [accessToken, apiUrl, bookingForm.date, currentUserRole, screen, selectedBookingDoctor?.id]);

  function resetRegistrationForm() {
    setClinicName("");
    setAdminName("");
    setPhone("");
    setPassword("");
    setEmail("");
  }

  function handleSignOut() {
    setCurrentUserRole("clinic_admin");
    setAccessToken("");
    setAiContext(null);
    setClinicProfile(emptyClinicProfile);
    setMobile("");
    setAuthMode("clinic_admin");
    setScreen("login");
    setMessage("You have been signed out.");
  }

  function renderAiPanel(context: AIContext | null) {
    if (!context || context.role === "platform_admin") {
      return null;
    }

    const firstAction = context.suggestedActions?.[0];
    const quickActions = context.suggestedActions?.slice(0, 3) ?? [];
    const screenFocus =
      context.screen === "appointments"
        ? {
            title: "Scheduling intelligence",
            note: "Review conflicts, pending bookings, and approval steps before confirming any change.",
            cards: ["Conflict check enabled", "Pending bookings visible", "Approval required before rescheduling"],
          }
        : context.screen === "patients"
          ? {
              title: "Patient intelligence",
              note: "Surface overdue follow-ups, recent visits, and clinic-scoped profile context before contacting the patient.",
              cards: ["Follow-up queue ready", "Recent activity summarized", "Profile context preserved"],
            }
          : null;

    const actionLabel = context.screen === "appointments"
      ? "Use ranked doctor/date"
      : context.screen === "patients"
        ? "Open recommended patient"
        : "Review recommendation";

    const actionHandler = () => {
      if (context.screen === "appointments" && recommendedPatient) {
        const recommendedDoctorName = context.recommendedDoctorName || eligibleDoctors[0]?.name || "";
        setBookingForm((current) => ({
          ...current,
          patient: recommendedPatient.name,
          doctor: recommendedDoctorName || current.doctor,
          date: context.recommendedDate || current.date,
          time: "",
          service: current.service || "Consultation",
        }));
        setSelectedPatientName(recommendedPatient.name);
        setScreen("appointments");
        setMessage(
          context.recommendedDoctorName && context.recommendedDate
            ? `AI ranked ${context.recommendedDoctorName} for ${context.recommendedDate}.`
            : `AI preloaded ${recommendedPatient.name} for the next booking.`,
        );
        return;
      }

      if (context.screen === "patients" && recommendedPatient) {
        setSelectedPatientName(recommendedPatient.name);
        setScreen("patients");
        setMessage(`AI opened ${recommendedPatient.name} for a quick review.`);
        return;
      }

      setMessage(context.summary);
    };

    return (
      <section className="mx-auto max-w-7xl px-5 pt-6">
        <div className="rounded-3xl border border-[#bfd7cd] bg-[linear-gradient(135deg,#f6fbf8_0%,#edf8f3_100%)] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">AI-native clinic workspace</p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#17362c]">AI-native clinic assistant that keeps patient care moving</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#587068]">
                {context.summary || "One AI layer for appointments, follow-ups, and care tasks so staff can act faster without losing control."}
              </p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${context.requiresApproval ? "bg-[#fff7e9] text-[#8a5e00]" : "bg-[#eaf5ef] text-[#0d523e]"}`}>
              {context.requiresApproval ? "Approval required" : "Suggestion only"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">What the assistant sees</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {context.signals.slice(0, 3).map((signal) => (
                  <span key={signal} className="rounded-full bg-[#f5faf7] px-3 py-1 text-xs font-medium text-[#17362c]">
                    {signal}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-[#587068]">
                Context is assembled from the current screen, clinic data, and live availability, then turned into a reviewable next step.
              </p>
            </div>

            <div className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">Suggested actions</p>
              <div className="mt-3 grid gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setMessage(action)}
                    className="rounded-xl border border-[#dfe9e1] bg-[#f8fbf9] px-3 py-2 text-left text-sm font-medium text-[#17362c] hover:border-[#19b3a2]"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#dfe9e1] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">Next best action</p>
              <p className="mt-1 text-sm text-[#587068]">Preload the most relevant patient, doctor, or appointment step in one tap.</p>
            </div>
            <button type="button" onClick={actionHandler} className="rounded-xl bg-[#19b3a2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#149d92]">
              {actionLabel}
            </button>
          </div>

          {screenFocus && (
            <div className="mt-5 rounded-2xl border border-[#dfe9e1] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">{screenFocus.title}</p>
              <p className="mt-2 text-sm text-[#587068]">{screenFocus.note}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {screenFocus.cards.map((card) => (
                  <div key={card} className="rounded-xl bg-[#f5faf7] px-3 py-2 text-sm font-medium text-[#17362c]">
                    {card}
                  </div>
                ))}
              </div>
            </div>
          )}

          {context.requiresApproval && firstAction && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#587068]">The first recommendation is ready for review before any action is taken.</p>
              <button
                type="button"
                onClick={async () => {
                  const response = await fetch(`${apiUrl}/api/ai/approve-action`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ screen: context.screen, action: firstAction, approved: true }),
                  });

                  if (!response.ok) {
                    throw new Error("Unable to record AI approval");
                  }

                  setMessage(`AI suggestion approved: ${firstAction}`);
                }}
                className="rounded-xl bg-[#19b3a2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#149d92]"
              >
                Review recommendation
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const normalizedPhone = mobile.trim();
      const normalizedName = patientName.trim();
      const isPublicPatientFlow = authMode === "patient" && Boolean(clinicProfile.publicSlug);
      const response = await fetch(
        isPublicPatientFlow
          ? `${apiUrl}/api/public/clinics/${encodeURIComponent(clinicProfile.publicSlug)}/patients/register`
          : `${apiUrl}/api/auth/login`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isPublicPatientFlow ? { name: normalizedName, phone: normalizedPhone, password } : authMode === "patient" ? { phone: normalizedPhone, password } : { email, password }),
        },
      );

      const payload = await response.json().catch(() => null) as { detail?: string; user?: { role?: string; clinic_id?: string; clinic_name?: string }; access_token?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.detail || "Sign in failed");
      }

      const data = payload as { user?: { role?: string; clinic_id?: string; clinic_name?: string }; access_token?: string };
      const role = String(data.user?.role ?? "").toLowerCase() as UserRole;
      if (role !== authMode && !(authMode === "clinic_admin" && role === "platform_admin")) {
        throw new Error("This account does not match the selected sign-in role.");
      }
      if (role === "patient" && clinicProfile.id && data.user?.clinic_id !== clinicProfile.id) {
        throw new Error("This patient account does not belong to the clinic in this QR code.");
      }
      if (!data.access_token) {
        throw new Error("Sign in did not return a session token.");
      }

      setAccessToken(data.access_token);
      const clinicNameFromServer = data.user?.clinic_name || "Clinic Workspace";

      if (role === "platform_admin") {
        setCurrentUserRole(role);
        setMessage(`Welcome back, ${clinicNameFromServer}.`);
        setScreen("dashboard");
        return;
      }

      if (role === "clinic_admin") {
        const profileResponse = await fetch(`${apiUrl}/api/clinics/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });

        if (!profileResponse.ok) throw new Error("Clinic profile could not be loaded");

        const profile = await profileResponse.json();
        setClinicProfile({ id: profile.id ?? "", name: profile.name ?? "", admin: profile.admin ?? "", email: profile.email ?? "", phone: profile.phone ?? "", address: profile.address ?? "", logo: profile.logo_url || profile.name?.slice(0, 2).toUpperCase() || "", publicSlug: profile.public_slug ?? "" });
      }

      setCurrentUserRole(role);
      setMessage(`Welcome back, ${clinicNameFromServer}.`);
      setScreen("dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Confirm the FastAPI backend is running.");
    }
  }

  async function registerClinic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/auth/register-clinic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_name: clinicName,
          admin_name: adminName,
          email,
          phone,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Clinic registration failed");
      }

      const bookingUrl = data.public_slug ? `${publicAppUrl}/clinic/${data.public_slug}` : "";
      setMessage(`Clinic account created for ${data.clinic_name}. Patient booking URL: ${bookingUrl}`);
      resetRegistrationForm();
      setEmail(data.email);
      setPassword("");
      setScreen("login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Clinic registration failed.");
    }
  }

  function toTwentyFourHourTime(displayTime: string) {
    const match = displayTime.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (!match) return displayTime;
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    return `${String(hours).padStart(2, "0")}:${match[2]}:00`;
  }

  function getNextAppointmentEndTime(displayTime: string) {
    const parsed = new Date(`1970-01-01T${toTwentyFourHourTime(displayTime)}`);
    if (Number.isNaN(parsed.getTime())) return "";
    parsed.setMinutes(parsed.getMinutes() + 30);
    return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}:00`;
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const patient = patientList.find((entry) => entry.name === bookingForm.patient);
    const doctor = doctorList.find((entry) => entry.name === bookingForm.doctor);
    const validationError = validatePatientDoctorClinicMatch(patient?.clinicId, doctor?.clinicId);

    if (validationError) {
      setAssignmentError(validationError);
      setMessage(validationError);
      return;
    }

    if (currentUserRole !== "clinic_admin") {
      setMessage("Patients can book from the mobile QR flow. Use the clinic dashboard to create staff-side appointments.");
      return;
    }

    if (!accessToken) {
      setMessage("Please sign in before creating an appointment.");
      return;
    }

    if (!patient || !doctor) {
      setMessage("Select a patient and doctor before creating the appointment.");
      return;
    }

    if (!bookingForm.date || !bookingForm.time) {
      setMessage("Select both a date and time for the appointment.");
      return;
    }

    setAssignmentError(null);

    try {
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          patient_id: patient.id,
          doctor_id: doctor.id,
          appointment_date: bookingForm.date,
          start_time: toTwentyFourHourTime(bookingForm.time),
          end_time: getNextAppointmentEndTime(bookingForm.time) || toTwentyFourHourTime(bookingForm.time),
          reason: bookingForm.service || "Consultation",
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || "Unable to create appointment.");
      }

      const newAppointment: Appointment = {
        id: data?.id,
        patient: patient.name,
        doctor: doctor.name,
        service: bookingForm.service || "Consultation",
        time: bookingForm.time,
        date: bookingForm.date,
        status: "Confirmed",
      };

      setSchedule((current) => [newAppointment, ...current]);
      setMessage(`Booking created for ${patient.name} with ${doctor.name}.`);
      setBookingForm({ patient: "", doctor: "", service: "", date: "", time: "" });
      setScreen("appointments");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create appointment.");
    }
  }

  function applyAiBookingRecommendation() {
    const patientNameToUse = recommendedPatient?.name || bookingForm.patient || selectedPatientName || patientList[0]?.name || "";
    const doctorNameToUse = appointmentAiDoctorName;
    const dateToUse = appointmentAiDate;
    const timeToUse = appointmentAiSlot;

    setBookingForm((current) => ({
      ...current,
      patient: patientNameToUse,
      doctor: doctorNameToUse,
      date: dateToUse,
      time: timeToUse,
      service: current.service || "Consultation",
    }));
    if (patientNameToUse) setSelectedPatientName(patientNameToUse);
    setScreen("appointments");
    setMessage(
      doctorNameToUse && dateToUse && timeToUse
        ? `AI booking applied for ${patientNameToUse} with ${doctorNameToUse} on ${dateToUse} at ${timeToUse}.`
        : "AI booking applied. Select a time slot if one is available.",
    );
  }

  const selectedDoctor = doctorList.find((doctor) => doctor.id === selectedDoctorId) ?? doctorList[0];

  function resetDoctorForm() {
    setNewDoctorForm({
      name: "",
      email: "",
      phone: "",
      specialization: "Cardiology",
      qualification: "MD (Cardiology)",
      licenseNumber: "",
      experience: "5 years",
      profilePhoto: "DR",
      consultationFee: 800,
      status: "Available",
      availability: "Available today",
      rating: 4.8,
    });
    setEditingDoctorId(null);
  }

  async function handleAddDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const doctorName = newDoctorForm.name.trim();
    if (!doctorName) return;

    const doctorPayload: Doctor = {
      id: editingDoctorId ?? undefined,
      name: doctorName,
      email: newDoctorForm.email.trim() || `${doctorName.toLowerCase().replace(/\s+/g, ".")}@clinic.com`,
      phone: newDoctorForm.phone.trim() || "+91 90000 00000",
      specialization: newDoctorForm.specialization,
      qualification: newDoctorForm.qualification,
      licenseNumber: newDoctorForm.licenseNumber.trim() || "Pending verification",
      experience: newDoctorForm.experience,
      profilePhoto: newDoctorForm.profilePhoto.trim() || doctorName.slice(0, 2).toUpperCase(),
      consultationFee: Number(newDoctorForm.consultationFee) || 800,
      status: newDoctorForm.status,
      availability: newDoctorForm.availability,
      rating: Number(newDoctorForm.rating),
      clinicId: "",
    };

    try {
      const response = await fetch(`${apiUrl}/api/doctors${editingDoctorId ? `/${editingDoctorId}` : ""}`, {
        method: editingDoctorId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ ...doctorPayload, license_number: doctorPayload.licenseNumber, profile_photo: doctorPayload.profilePhoto, consultation_fee: doctorPayload.consultationFee }),
      });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.detail || "Unable to save doctor.");
      const savedDoctor: Doctor = { ...doctorPayload, id: saved.id, clinicId: saved.clinic_id, licenseNumber: saved.license_number, profilePhoto: saved.profile_photo, consultationFee: Number(saved.consultation_fee) };
      setDoctorList((current) => editingDoctorId ? current.map((doctor) => doctor.id === editingDoctorId ? savedDoctor : doctor) : [savedDoctor, ...current]);
      setSelectedDoctorId(savedDoctor.id ?? "");
      setMessage(`${savedDoctor.name} was ${editingDoctorId ? "updated" : "added"} successfully.`);
      resetDoctorForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save doctor.");
    }
  }

  function handleEditDoctor(doctor: Doctor) {
    setEditingDoctorId(doctor.id ?? null);
    setSelectedDoctorId(doctor.id ?? "");
    setNewDoctorForm({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      licenseNumber: doctor.licenseNumber,
      experience: doctor.experience,
      profilePhoto: doctor.profilePhoto,
      consultationFee: doctor.consultationFee,
      status: doctor.status,
      availability: doctor.availability,
      rating: doctor.rating,
    });
  }

  async function handleDeleteDoctor(doctorId: string | undefined) {
    if (!doctorId) return;
    const doctor = doctorList.find((entry) => entry.id === doctorId);
    if (!doctor) return;
    const confirmed = window.confirm(`Delete ${doctor.name} from this clinic?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${apiUrl}/api/doctors/${doctorId}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) throw new Error("Unable to delete doctor.");
      setDoctorList((current) => current.filter((entry) => entry.id !== doctorId));
      if (selectedDoctorId === doctorId) setSelectedDoctorId("");
      if (editingDoctorId === doctorId) resetDoctorForm();
      setMessage(`${doctor.name} was removed from the clinic team.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete doctor.");
    }
  }

  async function handleAddPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPatientForm.name.trim()) return;

    const selectedDoctor = doctorList.find((doctor) => doctor.name === newPatientForm.doctor);
    const validationError = validatePatientDoctorClinicMatch(clinicProfile.name ? selectedDoctor?.clinicId : undefined, selectedDoctor?.clinicId);

    if (validationError) {
      setAssignmentError(validationError);
      setMessage(validationError);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/patients`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ name: newPatientForm.name.trim(), email: newPatientForm.email || null, phone: newPatientForm.phone || null }) });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.detail || "Unable to save patient.");
      const addedPatient: Patient = { id: saved.id, name: saved.name, email: saved.email, phone: saved.phone, lastVisit: saved.last_visit, clinicId: saved.clinic_id };
      setAssignmentError(null);
      setPatientList((current) => [addedPatient, ...current]);
      setSelectedPatientName(addedPatient.name);
      setMessage(`${addedPatient.name} was added successfully.`);
      setNewPatientForm({ name: "", email: "", phone: "", lastVisit: "Today", doctor: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save patient.");
    }
  }

  function updateAppointmentStatus(patientName: string, nextStatus: Appointment["status"]) {
    setSchedule((current) =>
      current.map((item) =>
        item.patient === patientName ? { ...item, status: nextStatus } : item,
      ),
    );
    setMessage(`Appointment for ${patientName} moved to ${nextStatus}.`);
  }

  if (screen === "login") {
    return (
      <LoginPage
        authMode={authMode}
        email={email}
        mobile={mobile}
        password={password}
        patientName={patientName}
        isPatientRegistration={isPatientRegistration}
        message={message}
        onAuthModeChange={(mode) => {
          setAuthMode(mode);
          if (mode === "patient") {
            setIsPatientRegistration(true);
          }
        }}
        onEmailChange={setEmail}
        onMobileChange={setMobile}
        onPasswordChange={setPassword}
        onPatientNameChange={setPatientName}
        onPatientRegistrationChange={setIsPatientRegistration}
        onSubmit={login}
        onCreateClinicClick={() => {
          resetRegistrationForm();
          setScreen("register");
        }}
      />
    );
  }

  if (screen === "register") {
    return (
      <CreateClinicAccountPage
        clinicName={clinicName}
        adminName={adminName}
        email={email}
        phone={phone}
        password={password}
        message={message}
        onClinicNameChange={setClinicName}
        onAdminNameChange={setAdminName}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onPasswordChange={setPassword}
        onSubmit={registerClinic}
        onBackToLogin={() => {
          resetRegistrationForm();
          setScreen("login");
        }}
      />
    );
  }

  const activeMeta = pageMeta[screen as keyof typeof pageMeta];
  const isPatientView = currentUserRole === "patient";
  const patientNavItems = [
    { key: "showcase", label: "Showcase", icon: Sparkles },
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "care_team", label: "My Doctor / Care Team", icon: Sparkles },
    { key: "appointments", label: "Appointments", icon: CalendarDays },
    { key: "medical_records", label: "Medical Records", icon: BadgeCheck },
    { key: "prescriptions", label: "Prescriptions", icon: Check },
    { key: "billing", label: "Payments / Billing", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "profile", label: "Profile", icon: Users },
  ];
  const doctorNavItems = [
    { key: "showcase", label: "Showcase", icon: Sparkles },
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "patients", label: "Patient Bookings", icon: Users },
    { key: "appointments", label: "Appointments", icon: CalendarDays },
    { key: "medical_records", label: "Medical Records", icon: BadgeCheck },
    { key: "prescriptions", label: "Prescriptions", icon: Stethoscope },
  ];
  const clinicBookingUrl = clinicProfile.publicSlug
    ? `${publicAppUrl}/clinic/${clinicProfile.publicSlug}`
    : "";
  const isLocalBookingUrl = Boolean(clinicBookingUrl) && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(clinicBookingUrl);

  if (currentUserRole === "platform_admin") {
    const platformNavItems = [
      { key: "showcase", label: "Showcase", icon: Sparkles },
      { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
      { key: "payments", label: "Payments", icon: CreditCard },
    ];

    return (
      <div className="min-h-screen bg-[#f3f6f3] text-[#17362c]">
        <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
          <Sidebar activePage={screen} onSelectPage={(page) => setScreen(page as Screen)} navItems={platformNavItems} brandName="Thinkare" />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Header title={screen === "payments" ? "Payments" : "Platform Dashboard"} subtitle="Central monitoring across all Thinkare clinics." userName="Super Admin" userRole="Platform Administration" brandName="Thinkare" onSignOut={handleSignOut} />
            <main className="flex-1"><SuperAdminDashboard apiUrl={apiUrl} accessToken={accessToken} view={screen === "payments" ? "payments" : "dashboard"} /></main>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f3] text-[#17362c]">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <Sidebar
          activePage={screen}
          onSelectPage={(page) => setScreen(page as Screen)}
          navItems={isPatientView ? patientNavItems : currentUserRole === "doctor" ? doctorNavItems : undefined}
          omitSettings={currentUserRole === "doctor"}
          brandName={clinicProfile.name}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header
            title={activeMeta.title}
            subtitle={activeMeta.subtitle}
            userName={currentUserRole === "doctor" ? "Dr. Ananya Rao" : currentUserRole === "patient" ? "Bhavani Patient" : "Admin"}
            userRole={currentUserRole === "doctor" ? "Doctor Profile" : currentUserRole === "patient" ? "Patient Access" : "Clinic Ops"}
            brandName={clinicProfile.name}
            onSignOut={handleSignOut}
          />

          <main className="flex-1">
            {screen === "showcase" && <ShowcasePage />}

            {screen === "dashboard" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="flex flex-col gap-5 border-b border-[#d8e2d9] pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[.14em] text-[#19b3a2]">Monday, 30 August</p>
                    <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[#17362c] sm:text-5xl">
                      {isPatientView ? "Patient care dashboard" : "Clinic operations dashboard"}
                    </h2>
                  </div>

                </div>

                {message && (
                  <p className="mt-6 rounded-xl border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm text-[#0d523e]">
                    {message}
                  </p>
                )}
                {assignmentError && (
                  <p className="mt-3 rounded-xl border border-[#f3b3b3] bg-[#fbe9ea] px-4 py-3 text-sm text-[#7a2222]">
                    {assignmentError}
                  </p>
                )}

                {renderAiPanel(aiContext)}

                {currentUserRole === "doctor" && (
                  <section className="mt-8 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div><p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Doctor workspace</p><h3 className="mt-2 text-2xl font-bold text-[#17362c]">Patient bookings</h3><p className="mt-1 text-sm text-[#587068]">Appointments assigned to Dr. Ananya Rao</p></div>
                      <button type="button" onClick={() => setScreen("appointments")} className="text-sm font-semibold text-[#19b3a2]">View all bookings</button>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {schedule.filter((item) => item.doctor === (selectedDoctor?.name || "Dr. Ananya Rao")).map((booking) => (
                        <button
                          key={`${booking.patient}-${booking.time}`}
                          type="button"
                          onClick={() => {
                            setSelectedPatientName(booking.patient);
                            setScreen("patients");
                          }}
                          className="rounded-2xl border border-[#dfe9e1] bg-white p-4 text-left hover:border-[#19b3a2]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#17362c]">{booking.patient}</p>
                              <p className="mt-1 text-sm text-[#587068]">{booking.service}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-[#587068]">{booking.date ? booking.date : "Today"} · {booking.time}</p>
                        </button>
                      ))}
                      {!schedule.some((item) => item.doctor === (selectedDoctor?.name || "Dr. Ananya Rao")) && (
                        <p className="rounded-2xl border border-dashed border-[#cfe1d7] bg-white px-4 py-6 text-sm text-[#587068]">
                          No patient bookings yet for this doctor.
                        </p>
                      )}
                    </div>
                  </section>
                )}

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  {(isPatientView
                    ? [
                        { label: "Upcoming visits", value: String(schedule.length), tone: "bg-[#19b3a2] text-white" },
                        { label: "Care plan", value: "Active", tone: "bg-[#eaf5ef] text-[#0d523e]" },
                        { label: "Records", value: "-", tone: "bg-[#fff7e9] text-[#8a5e00]" },
                        { label: "Prescriptions", value: "-", tone: "bg-[#edf3ff] text-[#1f3d7a]" },
                      ]
                    : [
                        { label: "Today", value: String(schedule.length), tone: "bg-[#19b3a2] text-white" },
                        { label: "Confirmed", value: String(schedule.filter((item) => item.status === "Confirmed").length), tone: "bg-[#eaf5ef] text-[#0d523e]" },
                        { label: "Waiting", value: String(schedule.filter((item) => item.status === "Waiting").length), tone: "bg-[#fff7e9] text-[#8a5e00]" },
                        { label: "Completed", value: String(schedule.filter((item) => item.status === "Completed").length), tone: "bg-[#edf3ff] text-[#1f3d7a]" },
                      ]
                  ).map((card) => (
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
                        <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#17362c]">Appointments</h3>
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
                            <select
                              value={item.status}
                              onChange={(event) => updateAppointmentStatus(item.patient, event.target.value as Appointment["status"])}
                              className="rounded-xl border border-[#c7d5ca] bg-white px-2.5 py-2 text-xs font-semibold text-[#17362c] outline-none"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Waiting">Waiting</option>
                              <option value="In progress">In progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(item.status)}`}>
                              {item.status}
                            </span>
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

                    {currentUserRole === "clinic_admin" && clinicBookingUrl && (
                      <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Clinic booking QR</p>
                        <div className="mt-4 flex items-center gap-4">
                          <QRCodeSVG value={clinicBookingUrl} size={96} includeMargin />
                          <a href={clinicBookingUrl} target="_blank" rel="noreferrer" className="min-w-0 break-all text-sm font-medium text-[#17362c] hover:text-[#19b3a2]">
                            {clinicBookingUrl}
                          </a>
                        </div>
                        {isLocalBookingUrl && (
                          <p className="mt-3 rounded-xl border border-[#f3b3b3] bg-[#fbe9ea] px-4 py-3 text-sm text-[#7a2222]">
                            This QR points to a local address. A phone can read the QR, but it will not open correctly unless <code>VITE_PUBLIC_APP_URL</code> is set to a reachable LAN or deployed URL.
                          </p>
                        )}
                      </div>
                    )}

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

            {screen === "care_team" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Care team</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#17362c]">Your assigned doctor</h3>
                    <div className="mt-6 rounded-2xl border border-[#dfe9e1] bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-semibold text-[#17362c]">
                            {assignedDoctorsForCurrentPatient[0]?.name ?? "Dr. Ananya Rao"}
                          </p>
                          <p className="mt-1 text-sm text-[#587068]">
                            {assignedDoctorsForCurrentPatient[0]?.specialization ?? "Cardiology"} · {assignedDoctorsForCurrentPatient[0]?.availability ?? "Available today"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#eaf9f7] px-2.5 py-1 text-xs font-semibold text-[#19b3a2]">On duty</span>
                      </div>
                      <p className="mt-4 text-sm text-[#587068]">Primary care coordination, specialist reviews, and follow-up planning are managed through this authorized clinic relationship.</p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Support</p>
                    <ul className="mt-4 space-y-3 text-sm text-[#587068]">
                      <li className="rounded-2xl bg-[#f5faf7] p-3">Nurse coordination: 9:00 AM - 5:00 PM</li>
                      <li className="rounded-2xl bg-[#f5faf7] p-3">Lab review: Monday and Thursday</li>
                      <li className="rounded-2xl bg-[#f5faf7] p-3">Care plan updates shared after clinic visits</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {screen === "appointments" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <div>
                    {assignmentError && (
                      <p className="mb-4 rounded-xl border border-[#f3b3b3] bg-[#fbe9ea] px-4 py-3 text-sm text-[#7a2222]">
                        {assignmentError}
                      </p>
                    )}
                    <div className="mb-6 rounded-3xl border border-[#bfd7cd] bg-[linear-gradient(135deg,#f6fbf8_0%,#edf8f3_100%)] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">AI booking assistant</p>
                      <p className="mt-2 text-sm leading-6 text-[#587068]">
                        {appointmentAiDoctorName
                          ? `Recommended doctor: ${appointmentAiDoctorName}. ${appointmentAiDate ? `Best date: ${appointmentAiDate}.` : ""} ${appointmentAiSlot ? `Earliest slot: ${appointmentAiSlot}.` : ""}`
                          : "Select a patient and doctor to let the assistant recommend the best available booking path."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={applyAiBookingRecommendation} className="rounded-xl bg-[#19b3a2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#149d92]">
                          Use AI recommendation
                        </button>
                        {availableSlotOptions[0] ? (
                          <button
                            type="button"
                            onClick={() => setBookingForm((current) => ({ ...current, time: availableSlotOptions[0] }))}
                            className="rounded-xl border border-[#cfe3da] bg-white px-4 py-2.5 text-sm font-semibold text-[#17362c] hover:border-[#19b3a2]"
                          >
                            Preload earliest slot
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <AppointmentForm
                      patients={patientList.map((patient) => ({ id: patient.id ?? patient.name, name: patient.name }))}
                      doctors={(currentUserRole === "patient" ? assignedDoctorsForCurrentPatient : eligibleDoctors).map((doctor) => ({ id: doctor.id ?? doctor.name, name: doctor.name }))}
                      timeSlots={availableSlotOptions}
                      form={bookingForm}
                      onChange={(field, value) => setBookingForm((current) => ({ ...current, [field]: value }))}
                      onSubmit={handleBookingSubmit}
                    />

                    <div className="mt-6 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">AI booking status</p>
                      <p className="mt-2 text-sm text-[#587068]">
                        {availableSlotOptions.length
                          ? `Earliest open slot: ${availableSlotOptions[0]}.`
                          : "Pick a doctor and date to load open slots."}
                      </p>
                    </div>
                  </div>

                  <aside className="space-y-6">
                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Available doctors</p>
                      <div className="mt-4 space-y-3">
                        {(currentUserRole === "patient" ? assignedDoctorsForCurrentPatient : doctorList).map((doctor) => (
                          <div key={doctor.name} className="rounded-2xl border border-[#dfe9e1] bg-white p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold text-[#17362c]">{doctor.name}</h4>
                              <span className="text-sm font-semibold text-[#19b3a2]">★ {doctor.rating}</span>
                            </div>
                            <p className="mt-1 text-sm text-[#587068]">{doctor.specialization}</p>
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

                    {currentUserRole !== "patient" && (
                      <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">AI next step</p>
                        <p className="mt-3 text-sm leading-6 text-[#587068]">The assistant will highlight conflicts, pending bookings, and the most relevant doctor before any confirmation is made.</p>
                      </div>
                    )}
                  </aside>
                </div>
              </section>
            )}

            {screen === "medical_records" && (
              <MedicalRecordsPage />
            )}

            {screen === "prescriptions" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Prescriptions</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#17362c]">Active medicines</h3>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      { name: "Amlodipine 5mg", timing: "Once daily", status: "Refill due in 7 days" },
                      { name: "Vitamin D3", timing: "Once daily", status: "On track" },
                    ].map((item) => (
                      <div key={item.name} className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
                        <p className="text-lg font-semibold text-[#17362c]">{item.name}</p>
                        <p className="mt-2 text-sm text-[#587068]">{item.timing}</p>
                        <span className="mt-3 inline-flex rounded-full bg-[#eaf5ef] px-2.5 py-1 text-xs font-semibold text-[#0d523e]">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {screen === "notifications" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Notifications</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#17362c]">Care updates</h3>
                  <div className="mt-6 space-y-3">
                    {[
                      "Your follow-up appointment is scheduled for Thursday at 10:30 AM.",
                      "Prescription refill reminder for Amlodipine has been generated.",
                      "New lab report from the clinic is ready to review.",
                    ].map((message) => (
                      <div key={message} className="rounded-2xl border border-[#dfe9e1] bg-white p-4 text-sm text-[#587068]">{message}</div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {screen === "profile" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Profile</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#17362c]">Patient details</h3>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[#f5faf7] p-4"><p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Name</p><p className="mt-2 text-lg font-semibold text-[#17362c]">Bhavani Patient</p></div>
                    <div className="rounded-2xl bg-[#f5faf7] p-4"><p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Clinic</p><p className="mt-2 text-lg font-semibold text-[#17362c]">Bhavani Clinic</p></div>
                    <div className="rounded-2xl bg-[#f5faf7] p-4"><p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Mobile</p><p className="mt-2 text-lg font-semibold text-[#17362c]">+91 98765 43210</p></div>
                    <div className="rounded-2xl bg-[#f5faf7] p-4"><p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Email</p><p className="mt-2 text-lg font-semibold text-[#17362c]">bhavani.patient@gmail.com</p></div>
                  </div>
                </div>
              </section>
            )}

            {screen === "patients" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="mb-6 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Patient management</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#17362c]">Add new patient</h3>

                  <form onSubmit={handleAddPatient} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <input
                      value={newPatientForm.name}
                      onChange={(event) => setNewPatientForm({ ...newPatientForm, name: event.target.value })}
                      placeholder="Patient name"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newPatientForm.email}
                      onChange={(event) => setNewPatientForm({ ...newPatientForm, email: event.target.value })}
                      type="email"
                      placeholder="Email"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newPatientForm.phone}
                      onChange={(event) => setNewPatientForm({ ...newPatientForm, phone: event.target.value })}
                      placeholder="Phone"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <select
                      value={newPatientForm.doctor}
                      onChange={(event) => setNewPatientForm({ ...newPatientForm, doctor: event.target.value })}
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    >
                      {eligibleDoctors.map((doctor) => (
                        <option key={doctor.name} value={doctor.name}>{doctor.name}</option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-xl bg-[#19b3a2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#149d92]">
                      Save patient
                    </button>
                  </form>
                </div>

                <div className="mb-6 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">AI patient notes</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-[#f5faf7] p-4">
                      <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Follow-up</p>
                      <p className="mt-2 text-sm text-[#587068]">Prioritize patients with overdue review windows and recent appointment gaps.</p>
                    </div>
                    <div className="rounded-2xl bg-[#f5faf7] p-4">
                      <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Context</p>
                      <p className="mt-2 text-sm text-[#587068]">Summaries should expose last visit, assigned doctor, and active care items before any outreach.</p>
                    </div>
                    <div className="rounded-2xl bg-[#f5faf7] p-4">
                      <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Approval</p>
                      <p className="mt-2 text-sm text-[#587068]">Keep any reassignment or record update behind explicit admin approval.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    {visiblePatients.map((patient) => (
                      <button
                        key={patient.name + patient.email}
                        type="button"
                        onClick={() => setSelectedPatientName(patient.name)}
                        className={`rounded-3xl border p-5 text-left shadow-[0_10px_30px_rgba(20,108,82,0.05)] ${selectedPatientName === patient.name ? "border-[#19b3a2] bg-[#eaf9f7]" : "border-[#d8e2d9] bg-[#fcfdf9]"}`}
                      >
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
                      </button>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    {(() => {
                      const patient = visiblePatients.find((entry) => entry.name === selectedPatientName) ?? visiblePatients[0] ?? {
                        name: "Patient",
                        email: "",
                        phone: "",
                        lastVisit: "No visits yet",
                      };
                      const upcomingVisit = schedule.find((item) => item.patient === patient.name);
                      const assignedDoctor = assignedDoctorsForCurrentPatient[0] ?? doctorList[0];

                      return (
                        <>
                          <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Patient profile</p>
                          <div className="mt-5 flex items-center gap-4">
                            <div className="grid size-14 place-items-center rounded-full bg-[#eaf9f7] text-xl font-bold text-[#19b3a2]">
                              {patient.name.slice(0, 1)}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#17362c]">{patient.name}</h3>
                              <p className="text-sm text-[#587068]">Assigned to {assignedDoctor?.name ?? "No doctor assigned"}</p>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-[#f5faf7] p-4">
                              <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Email</p>
                              <p className="mt-2 text-sm font-medium text-[#17362c]">{patient.email}</p>
                            </div>
                            <div className="rounded-2xl bg-[#f5faf7] p-4">
                              <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Phone</p>
                              <p className="mt-2 text-sm font-medium text-[#17362c]">{patient.phone}</p>
                            </div>
                          </div>

                          <div className="mt-6 rounded-2xl border border-[#dfe9e1] bg-white p-4">
                            <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Upcoming visit</p>
                            <p className="mt-2 text-lg font-semibold text-[#17362c]">{upcomingVisit ? upcomingVisit.doctor : "Dr. Ananya Rao"}</p>
                            <p className="mt-1 text-sm text-[#587068]">{upcomingVisit ? upcomingVisit.time : "09:00 AM"}</p>
                            <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${upcomingVisit ? statusClasses(upcomingVisit.status) : "bg-[#eaf5ef] text-[#0d523e]"}`}>
                              {upcomingVisit ? upcomingVisit.status : "Confirmed"}
                            </span>
                          </div>

                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
                              <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Assigned doctor</p>
                              <p className="mt-2 text-lg font-semibold text-[#17362c]">{assignedDoctor?.name ?? "No doctor assigned"}</p>
                              <p className="mt-1 text-sm text-[#587068]">{assignedDoctor?.specialization ?? "General Physician"}</p>
                              <p className="mt-1 text-sm text-[#587068]">{assignedDoctor?.email ?? "No doctor account linked"}</p>
                              <span className="mt-3 inline-flex rounded-full bg-[#eaf5ef] px-2.5 py-1 text-xs font-semibold text-[#0d523e]">● Active</span>
                              <div className="mt-4 flex gap-3"><button type="button" onClick={() => setScreen("doctors")} className="text-sm font-semibold text-[#19b3a2]">View doctor</button><button type="button" onClick={() => setMessage("Doctor assignment changes require clinic administrator approval.")} className="text-sm font-semibold text-[#19b3a2]">Change</button></div>
                            </div>
                            <div className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
                              <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Doctor access</p>
                              <p className="mt-2 text-lg font-semibold text-[#17362c]">● Active</p>
                              <p className="mt-1 text-sm leading-6 text-[#587068]">{assignedDoctor?.name ?? "No doctor"} can access this patient&apos;s medical records and appointments.</p>
                              <p className="mt-3 text-xs text-[#587068]">Last accessed: Today, 10:32 AM</p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            {["Medical records", "Appointments", "Billing summary"].map((label) => <div key={label} className="rounded-2xl bg-[#f5faf7] p-4"><p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">{label}</p><p className="mt-2 text-sm font-semibold text-[#17362c]">Available to assigned doctor</p></div>)}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </section>
            )}

            {screen === "doctors" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="mb-6 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Doctor management</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#17362c]">
                    {editingDoctorId ? "Edit doctor" : "Add new doctor"}
                  </h3>

                  <form onSubmit={handleAddDoctor} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <input
                      value={newDoctorForm.name}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, name: event.target.value })}
                      placeholder="Doctor name"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newDoctorForm.email}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, email: event.target.value })}
                      type="email"
                      placeholder="Email"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newDoctorForm.phone}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, phone: event.target.value })}
                      placeholder="Phone"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <select
                      value={newDoctorForm.specialization}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, specialization: event.target.value })}
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                    <input
                      value={newDoctorForm.qualification}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, qualification: event.target.value })}
                      placeholder="Qualification"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newDoctorForm.licenseNumber}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, licenseNumber: event.target.value })}
                      placeholder="License number"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newDoctorForm.experience}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, experience: event.target.value })}
                      placeholder="Experience"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newDoctorForm.profilePhoto}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, profilePhoto: event.target.value })}
                      placeholder="Profile photo initials"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newDoctorForm.consultationFee}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, consultationFee: Number(event.target.value) || 0 })}
                      type="number"
                      placeholder="Consultation fee"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <select
                      value={newDoctorForm.status}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, status: event.target.value as Doctor["status"] })}
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="On leave">On leave</option>
                      <option value="Booked">Booked</option>
                    </select>
                    <input
                      value={newDoctorForm.availability}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, availability: event.target.value })}
                      placeholder="Availability / schedule"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <input
                      value={newDoctorForm.rating}
                      onChange={(event) => setNewDoctorForm({ ...newDoctorForm, rating: Number(event.target.value) || 0 })}
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="Rating"
                      className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button type="submit" className="flex-1 rounded-xl bg-[#19b3a2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#149d92]">
                        {editingDoctorId ? "Update doctor" : "Save doctor"}
                      </button>
                      {editingDoctorId && (
                        <button type="button" onClick={resetDoctorForm} className="rounded-xl border border-[#c7d5ca] bg-white px-4 py-3 text-sm font-semibold text-[#17362c]">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {doctorList.map((doctor) => (
                    <div key={doctor.id ?? doctor.name} className={`rounded-3xl border p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)] ${selectedDoctorId === doctor.id ? "border-[#19b3a2] bg-[#eaf9f7]" : "border-[#d8e2d9] bg-[#fcfdf9]"}`}>
                      <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setSelectedDoctorId(doctor.id ?? "")} className="grid size-12 place-items-center rounded-full bg-[#eaf9f7] text-lg font-bold text-[#19b3a2]">
                          {doctor.profilePhoto || doctor.name.slice(0, 1)}
                        </button>
                        <span className="text-sm font-semibold text-[#19b3a2]">★ {doctor.rating}</span>
                      </div>

                      <button type="button" onClick={() => setSelectedDoctorId(doctor.id ?? "")} className="mt-4 block text-left">
                        <h3 className="text-xl font-semibold text-[#17362c]">{doctor.name}</h3>
                        <p className="mt-1 text-sm text-[#587068]">{doctor.specialization}</p>
                        <p className="mt-4 text-xs font-medium uppercase tracking-[.12em] text-[#19b3a2]">{doctor.availability}</p>
                      </button>

                      <div className="mt-4 flex gap-2">
                        <button type="button" onClick={() => handleEditDoctor(doctor)} className="flex-1 rounded-xl border border-[#c7d5ca] bg-white px-3 py-2 text-sm font-semibold text-[#17362c]">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteDoctor(doctor.id)} className="flex-1 rounded-xl border border-[#e7b7bc] bg-[#fff0f2] px-3 py-2 text-sm font-semibold text-[#8a1f2d]">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedDoctor && (
                  <div className="mt-8 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Doctor profile</p>
                    <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="grid size-16 place-items-center rounded-full bg-[#eaf9f7] text-2xl font-bold text-[#19b3a2]">
                          {selectedDoctor.profilePhoto || selectedDoctor.name.slice(0, 1)}
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold tracking-[-0.05em] text-[#17362c]">{selectedDoctor.name}</h3>
                          <p className="mt-1 text-sm text-[#587068]">{selectedDoctor.specialization}</p>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${selectedDoctor.status === "Available" ? "bg-[#eaf5ef] text-[#0d523e]" : selectedDoctor.status === "Booked" ? "bg-[#edf3ff] text-[#1f3d7a]" : "bg-[#fff7e9] text-[#8a5e00]"}`}>
                        {selectedDoctor.status}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Email</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">{selectedDoctor.email}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Phone</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">{selectedDoctor.phone}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Qualification</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">{selectedDoctor.qualification}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Experience</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">{selectedDoctor.experience}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">License</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">{selectedDoctor.licenseNumber}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Consultation fee</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">₹{selectedDoctor.consultationFee}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Rating</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">★ {selectedDoctor.rating}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Schedule</p>
                        <p className="mt-2 text-sm font-medium text-[#17362c]">{selectedDoctor.availability}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {screen === "clinics" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="grid gap-5 lg:grid-cols-3">
                  {[
                    { name: "Downtown Care Center", city: "New York", capacity: "24 rooms", status: "Open" },
                    { name: "Lakeview Clinic", city: "Chicago", capacity: "18 rooms", status: "Busy" },
                    { name: "Greenwood Health", city: "Austin", capacity: "14 rooms", status: "Open" },
                  ].map((clinic) => (
                    <div key={clinic.name} className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-[#17362c]">{clinic.name}</h3>
                        <span className="rounded-full bg-[#eaf9f7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#19b3a2]">{clinic.status}</span>
                      </div>
                      <p className="mt-3 text-sm text-[#587068]">{clinic.city}</p>
                      <div className="mt-5 rounded-2xl bg-[#f5faf7] p-4">
                        <p className="text-xs uppercase tracking-[.12em] text-[#19b3a2]">Capacity</p>
                        <p className="mt-2 text-2xl font-bold text-[#17362c]">{clinic.capacity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {screen === "availability" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Schedule</p>
                      <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#17362c]">Doctor availability</h3>
                    </div>
                    <button className="rounded-xl bg-[#19b3a2] px-4 py-2.5 text-sm font-semibold text-white">Add slot</button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#dfe9e1]">
                    <table className="w-full text-left text-sm text-[#17362c]">
                      <thead className="bg-[#f5faf7] text-[#587068]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Doctor</th>
                          <th className="px-4 py-3 font-semibold">Day</th>
                          <th className="px-4 py-3 font-semibold">Slots</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Dr. Ananya Rao", "Mon", "8 slots", "Open"],
                          ["Dr. Kabir Menon", "Tue", "5 slots", "Limited"],
                          ["Dr. Aisha Patel", "Wed", "9 slots", "Open"],
                        ].map(([doctor, day, slots, status]) => (
                          <tr key={doctor} className="border-t border-[#dfe9e1]">
                            <td className="px-4 py-3 font-medium">{doctor}</td>
                            <td className="px-4 py-3">{day}</td>
                            <td className="px-4 py-3">{slots}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${status === "Open" ? "bg-[#eaf9f7] text-[#19b3a2]" : "bg-[#fff7e9] text-[#8a5e00]"}`}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {screen === "billing" && (
              <BillingPage />
            )}

          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
