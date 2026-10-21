import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BadgeCheck, Bell, CalendarDays, Check, CreditCard, HeartPulse, LayoutGrid, Search, Sparkles, Stethoscope, Users } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { validatePatientDoctorClinicMatch } from "./clinicValidation";
import { LoginPage } from "./pages/auth/LoginPage";
import { CreateClinicAccountPage } from "./pages/auth/CreateClinicAccountPage";
import { MedicalRecordsPage } from "./components/medical-records/MedicalRecordsPage";
import { ConnectedDevicesPage } from "./components/ConnectedDevicesPage";
import { AppointmentForm } from "./components/appointments/AppointmentForm";
import { BillingPage } from "./components/billing/BillingPage";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import { ShowcasePage } from "./components/ShowcasePage";
import { ClinicDashboard } from "./components/ClinicDashboard";

type Screen = "login" | "register" | "showcase" | "dashboard" | "payments" | "care_team" | "appointments" | "medical_records" | "prescriptions" | "patients" | "doctors" | "clinics" | "availability" | "billing" | "notifications" | "profile" | "connected_devices";
type AuthMode = "clinic_admin" | "doctor" | "patient";
type UserRole = "clinic_admin" | "platform_admin" | "doctor" | "patient";

type Appointment = {
  id?: string;
  date?: string;
  time: string;
  patient: string;
  doctor: string;
  service: string;
  status: "Confirmed" | "Waiting" | "In progress" | "Completed" | "Cancelled";
  bloodPressure?: string;
  clinicId?: string;
  patientId?: string;
  doctorId?: string;
};

type PatientTableRow = {
  id: string;
  index: string;
  patient: string;
  code: string;
  contact: string;
  ageGender: string;
  bloodGroup: string;
  lastVisit: string;
  nextAppointment: string;
  status: keyof typeof patientStatusClasses;
  avatar: string;
};

type Doctor = {
  id?: string;
  clinicId?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  licenseNumber?: string;
  experience?: string;
  profilePhoto?: string;
  consultationFee?: number;
  status: "Available" | "On leave" | "Booked";
  availability: string;
  rating: number;
};

type Patient = {
  id?: string;
  clinicId?: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  assignedDoctorName?: string;
};

type ClinicProfile = {
  id?: string;
  name: string;
  admin?: string;
  email?: string;
  phone?: string;
  address: string;
  logo: string;
  publicSlug: string;
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
  recommendedDoctorName: string;
  recommendedDoctorId: string;
  recommendedDate: string;
  patientName: string;
  rankedDoctors: Array<{ id: string; name: string; workload: number; patientHistory: number; score: number }>;
};

type StoredSession = {
  accessToken: string;
  currentUserRole: UserRole;
  authMode: AuthMode;
  clinicProfile: ClinicProfile;
  screen: Screen;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const publicAppUrl = window.location.origin;
const sessionStorageKey = "thinkare-session";
const emptyClinicProfile: ClinicProfile = { id: "", name: "Thinkare Clinic", address: "", logo: "TH", publicSlug: "" };

const pageMeta = {
  login: { title: "Welcome", subtitle: "Sign in to the clinic workspace." },
  register: { title: "Create clinic", subtitle: "Set up a clinic account." },
  showcase: { title: "Showcase", subtitle: "Design previews and product view." },
  dashboard: { title: "Dashboard", subtitle: "Clinic overview and daily actions." },
  payments: { title: "Payments", subtitle: "Platform billing and reconciliation." },
  care_team: { title: "Care team", subtitle: "Assigned doctor and care overview." },
  appointments: { title: "Appointments", subtitle: "Book, review, and manage slots." },
  medical_records: { title: "Medical records", subtitle: "Patient history and files." },
  prescriptions: { title: "Prescriptions", subtitle: "Medication and treatment plans." },
  patients: { title: "Patients", subtitle: "Patient directory and details." },
  doctors: { title: "Doctors", subtitle: "Doctors and clinic coverage." },
  clinics: { title: "Clinics", subtitle: "Clinic settings and locations." },
  availability: { title: "Availability", subtitle: "Schedules and working hours." },
  billing: { title: "Billing", subtitle: "Invoices, payments, and plans." },
  notifications: { title: "Notifications", subtitle: "System alerts and messages." },
  profile: { title: "Profile", subtitle: "Your account and preferences." },
  connected_devices: { title: "Connected Devices", subtitle: "Manage your Fitbit connection and shared health data." },
} as const;

const appointmentDemoDoctors: Doctor[] = [
  { id: "doc-1", clinicId: "clinic-1", name: "Dr. Ananya Rao", email: "ananya@thinkare.local", phone: "+91 98765 43210", specialization: "Cardiology", status: "Available", availability: "Mon - Fri, 9:00 AM - 5:00 PM", rating: 4.9 },
  { id: "doc-2", clinicId: "clinic-1", name: "Dr. Meera Iyer", email: "meera@thinkare.local", phone: "+91 90000 11223", specialization: "Dermatology", status: "Available", availability: "Tue - Sat, 10:00 AM - 4:00 PM", rating: 4.8 },
  { id: "doc-3", clinicId: "clinic-1", name: "Dr. Priya Sharma", email: "priya@thinkare.local", phone: "+91 99999 88888", specialization: "Pediatrics", status: "Booked", availability: "Mon - Sat, 8:30 AM - 2:30 PM", rating: 4.7 },
];

const appointmentDemoPatients: Patient[] = [
  { id: "pat-1", clinicId: "clinic-1", name: "Bhavani", email: "bhavani@example.com", phone: "+91 97000 11223", lastVisit: "Today" },
  { id: "pat-2", clinicId: "clinic-1", name: "Arjun", email: "arjun@example.com", phone: "+91 97000 44556", lastVisit: "Yesterday" },
  { id: "pat-3", clinicId: "clinic-1", name: "Meena", email: "meena@example.com", phone: "+91 97000 77889", lastVisit: "28 Aug 2024" },
];

const appointmentDemoSchedule: Appointment[] = [
  { id: "apt-1", date: "2024-08-30", time: "09:00 AM", patient: "Bhavani", doctor: "Dr. Ananya Rao", service: "Consultation", status: "Confirmed", clinicId: "clinic-1" },
  { id: "apt-2", date: "2024-08-30", time: "11:00 AM", patient: "Arjun", doctor: "Dr. Meera Iyer", service: "Review", status: "Waiting", clinicId: "clinic-1" },
  { id: "apt-3", date: "2024-08-31", time: "02:00 PM", patient: "Meena", doctor: "Dr. Priya Sharma", service: "Follow-up", status: "Completed", clinicId: "clinic-1" },
];

const patientStatusClasses: Record<"New" | "Active" | "Follow-up" | "Inactive", string> = {
  New: "bg-[#edf5ff] text-[#2563eb]",
  Active: "bg-[#eaf9f7] text-[#0d523e]",
  "Follow-up": "bg-[#fff4df] text-[#9c6a00]",
  Inactive: "bg-[#edf1f4] text-[#6b7280]",
};

const statusClasses = (status: Appointment["status"]) => {
  switch (status) {
    case "Confirmed":
      return "bg-[#eaf9f7] text-[#0d523e]";
    case "Completed":
      return "bg-[#edf5ff] text-[#2563eb]";
    case "Waiting":
      return "bg-[#fff4df] text-[#9c6a00]";
    case "Cancelled":
      return "bg-[#fde8e8] text-[#b91c1c]";
    default:
      return "bg-[#eef3ef] text-[#587068]";
  }
};

function App() {
  const storedSession = (() => {
    try {
      const raw = window.localStorage.getItem(sessionStorageKey);
      return raw ? (JSON.parse(raw) as Partial<StoredSession>) : null;
    } catch {
      return null;
    }
  })();
  const canReuseStoredSession = Boolean(storedSession?.accessToken);
  const currentClinicSlug = window.location.pathname.match(/^\/clinic\/([^/]+)$/)?.[1];
  const initialScreen: Screen = (storedSession?.screen as Screen | undefined) ?? "login";
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [authMode, setAuthMode] = useState<AuthMode>(canReuseStoredSession ? (storedSession?.authMode ?? "clinic_admin") : currentClinicSlug ? "patient" : "clinic_admin");
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(storedSession?.currentUserRole ?? "clinic_admin");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isPatientRegistration, setIsPatientRegistration] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>(storedSession?.clinicProfile ?? emptyClinicProfile);
  const [accessToken, setAccessToken] = useState(storedSession?.accessToken ?? "");
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
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
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
        setIsPatientRegistration(false);
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

  const patientTableRows = useMemo<PatientTableRow[]>(() => {
    const fallbackRows: PatientTableRow[] = [
      { id: "demo-p1", index: "1", patient: "Sharma", code: "PT-1001", contact: "patient-917987847603@thinkare.local\n+91 917987847603", ageGender: "34 / Male", bloodGroup: "O+", lastVisit: "No visits yet", nextAppointment: "30 Aug 2024\n09:00 AM", status: "New", avatar: "S" },
      { id: "demo-p2", index: "2", patient: "Priya Sharma", code: "PT-1002", contact: "priya@gmail.com\n+91 9876543210", ageGender: "28 / Female", bloodGroup: "A+", lastVisit: "28 Aug 2024", nextAppointment: "02 Sep 2024\n10:30 AM", status: "Active", avatar: "P" },
      { id: "demo-p3", index: "3", patient: "Ravi Kumar", code: "PT-1003", contact: "ravi@example.com\n+91 9123456780", ageGender: "42 / Male", bloodGroup: "B+", lastVisit: "25 Aug 2024", nextAppointment: "-", status: "Follow-up", avatar: "R" },
      { id: "demo-p4", index: "4", patient: "Anita Joseph", code: "PT-1004", contact: "anita@example.com\n+91 9012345678", ageGender: "31 / Female", bloodGroup: "O-", lastVisit: "30 Aug 2024", nextAppointment: "05 Sep 2024\n11:30 AM", status: "Active", avatar: "A" },
      { id: "demo-p5", index: "5", patient: "Karthik Raj", code: "PT-1005", contact: "karthik@example.com\n+91 9000111111", ageGender: "36 / Male", bloodGroup: "AB+", lastVisit: "21 Aug 2024", nextAppointment: "-", status: "Inactive", avatar: "K" },
      { id: "demo-p6", index: "6", patient: "Sneha Nair", code: "PT-1006", contact: "sneha@example.com\n+91 9887766554", ageGender: "27 / Female", bloodGroup: "B-", lastVisit: "29 Aug 2024", nextAppointment: "03 Sep 2024\n04:00 PM", status: "Active", avatar: "S" },
      { id: "demo-p7", index: "7", patient: "Vikram S", code: "PT-1007", contact: "vikram@example.com\n+91 9876123456", ageGender: "45 / Male", bloodGroup: "O+", lastVisit: "18 Aug 2024", nextAppointment: "-", status: "Follow-up", avatar: "V" },
      { id: "demo-p8", index: "8", patient: "Arun Raj", code: "PT-1008", contact: "arun@example.com\n+91 9796543210", ageGender: "39 / Male", bloodGroup: "A-", lastVisit: "27 Aug 2024", nextAppointment: "31 Aug 2024\n02:00 PM", status: "Active", avatar: "A" },
      { id: "demo-p9", index: "9", patient: "Meena Iyer", code: "PT-1009", contact: "meena@example.com\n+91 9887012345", ageGender: "33 / Female", bloodGroup: "B+", lastVisit: "26 Aug 2024", nextAppointment: "-", status: "Inactive", avatar: "M" },
      { id: "demo-p10", index: "10", patient: "Suresh Babu", code: "PT-1010", contact: "suresh@example.com\n+91 9845012345", ageGender: "50 / Male", bloodGroup: "O-", lastVisit: "20 Aug 2024", nextAppointment: "01 Sep 2024\n09:30 AM", status: "Active", avatar: "S" },
    ];

    const liveRows = patientList.map((patient, index) => {
      const upcoming = schedule.find((item) => item.patient === patient.name);
      const nextAppointment = upcoming ? `${upcoming.date ?? "Today"}\n${upcoming.time}` : "-";
      return {
        id: patient.id ?? `${patient.name}-${index}`,
        index: String(index + 1).padStart(2, "0"),
        patient: patient.name,
        code: `PT-${String(1000 + index + 1)}`,
        contact: `${patient.email || "No email"}\n${patient.phone || "No phone"}`,
        ageGender: index % 2 === 0 ? "34 / Male" : "28 / Female",
        bloodGroup: ["O+", "A+", "B+", "O-", "AB+", "B-"][index % 6],
        lastVisit: patient.lastVisit,
        nextAppointment,
        status: upcoming ? "Active" : index % 3 === 0 ? "New" : index % 3 === 1 ? "Active" : "Follow-up",
        avatar: patient.name.slice(0, 1).toUpperCase(),
      } satisfies PatientTableRow;
    });

    const rows = liveRows.length > 0 ? [...liveRows, ...fallbackRows] : fallbackRows;
    return rows.slice(0, 10);
  }, [patientList, schedule]);

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

  useEffect(() => {
    if (screen !== "appointments") return;

    const firstPatient = (patientList[0] ?? appointmentDemoPatients[0])?.name ?? "";
    const firstDoctor = ((currentUserRole === "patient" ? assignedDoctorsForCurrentPatient : doctorList)[0] ?? appointmentDemoDoctors[0])?.name ?? "";
    const firstDate = bookingForm.date || appointmentDemoSchedule[0].date || new Date().toISOString().slice(0, 10);
    const firstTime = bookingForm.time || availableSlotOptions[0] || appointmentDemoSchedule[0].time;
    const shouldSeedForm = !bookingForm.patient || !bookingForm.doctor || !bookingForm.service || !bookingForm.date || !bookingForm.time;

    if (shouldSeedForm) {
      setBookingForm((current) => ({
        ...current,
        patient: current.patient || firstPatient,
        doctor: current.doctor || firstDoctor,
        service: current.service || "Consultation",
        date: current.date || firstDate,
        time: current.time || firstTime,
      }));
    }

    if (!selectedPatientName && firstPatient) {
      setSelectedPatientName(firstPatient);
    }
  }, [appointmentDemoPatients, appointmentDemoSchedule, assignedDoctorsForCurrentPatient, availableSlotOptions, bookingForm.date, bookingForm.service, bookingForm.time, currentUserRole, doctorList, patientList, screen, selectedPatientName]);

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


  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const normalizedPhone = mobile.trim();
      const normalizedName = patientName.trim();
      const isPublicPatientFlow = authMode === "patient" && Boolean(clinicProfile.publicSlug);
      const response = await fetch(
        isPublicPatientFlow && isPatientRegistration
          ? `${apiUrl}/api/public/clinics/${encodeURIComponent(clinicProfile.publicSlug)}/patients/register`
          : `${apiUrl}/api/auth/login`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isPublicPatientFlow && isPatientRegistration
            ? { name: normalizedName, phone: normalizedPhone, password }
            : authMode === "patient"
              ? { phone: normalizedPhone, password }
              : { email, password },
        ),
        },
      );

      const payload = await response.json().catch(() => null) as { detail?: string; user?: { id?: string; role?: string; clinic_id?: string; clinic_name?: string }; access_token?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.detail || "Sign in failed");
      }

      const data = payload as { user?: { id?: string; role?: string; clinic_id?: string; clinic_name?: string }; access_token?: string };
      const role = String(data.user?.role ?? "").toLowerCase() as UserRole;
      if (role !== authMode && !(authMode === "clinic_admin" && role === "platform_admin")) {
        throw new Error("This account does not match the selected sign-in role.");
      }
      if (role === "patient" && clinicProfile.id && data.user?.clinic_id !== clinicProfile.id && data.user?.id !== "user-demo-patient") {
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

    if (!patient.id || !doctor.id) {
      setMessage("Select a saved patient and doctor before creating an appointment.");
      return;
    }

    if (!bookingForm.date || !bookingForm.time) {
      setMessage("Select both a date and time for the appointment.");
      return;
    }

    setAssignmentError(null);

    try {
      const slotsResponse = await fetch(
        `${apiUrl}/api/slots?doctor_id=${encodeURIComponent(doctor.id)}&slot_date=${encodeURIComponent(bookingForm.date)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const slots = await slotsResponse.json() as Array<{ id: string; start_time: string }> | { detail?: string };
      if (!slotsResponse.ok) {
        throw new Error((!Array.isArray(slots) && slots.detail) || "Unable to load available appointment slots.");
      }
      if (!Array.isArray(slots)) {
        throw new Error("The available appointment slots response was invalid.");
      }

      const selectedSlot = slots.find((slot) => slot.start_time.slice(0, 5) === bookingForm.time.slice(0, 5));
      if (!selectedSlot) {
        throw new Error("That time is not available for the selected date.");
      }

      const bookingResponse = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          patient_id: patient.id,
          reason: bookingForm.service || "Consultation",
        }),
      });
      const data = await bookingResponse.json() as { id?: string; detail?: string };
      if (!bookingResponse.ok) {
        throw new Error(data.detail || "Unable to create appointment.");
      }

      const newAppointment: Appointment = {
        id: data.id,
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
      const message = error instanceof Error ? error.message : "Unable to create appointment.";
      setAssignmentError(message);
      setMessage(message);
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
      setMessage(`${savedDoctor.name} was ${editingDoctorId ? "updated" : "added"} successfully.`);
      resetDoctorForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save doctor.");
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
          setIsPatientRegistration(false);
          setPatientName("");
          setMobile("");
          setEmail("");
          setPassword("");
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
    { key: "connected_devices", label: "Connected Devices", icon: HeartPulse },
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

            {screen === "connected_devices" && isPatientView && (
              <ConnectedDevicesPage apiUrl={apiUrl} accessToken={accessToken} />
            )}

            {screen === "dashboard" && (
              <ClinicDashboard
                userName={currentUserRole === "doctor" ? "Dr. Ananya Rao" : currentUserRole === "patient" ? "Bhavani Patient" : "Admin"}
                clinicName={clinicProfile.name}
                schedule={schedule}
                doctors={doctorList}
                patients={patientList}
                clinicBookingUrl={clinicBookingUrl}
                isLocalBookingUrl={isLocalBookingUrl}
                onOpenAppointments={() => setScreen("appointments")}
                onOpenPatients={() => setScreen("patients")}
                onOpenDoctors={() => setScreen("doctors")}
                onOpenClinics={() => setScreen("clinics")}
                onOpenAvailability={() => setScreen("availability")}
              />
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
                      patients={(patientList.length ? patientList : appointmentDemoPatients).map((patient) => ({ id: patient.id ?? patient.name, name: patient.name }))}
                      doctors={(currentUserRole === "patient"
                        ? (assignedDoctorsForCurrentPatient.length ? assignedDoctorsForCurrentPatient : appointmentDemoDoctors)
                        : (eligibleDoctors.length ? eligibleDoctors : appointmentDemoDoctors)
                      ).map((doctor) => ({ id: doctor.id ?? doctor.name, name: doctor.name }))}
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
                        {(currentUserRole === "patient"
                          ? (assignedDoctorsForCurrentPatient.length ? assignedDoctorsForCurrentPatient : appointmentDemoDoctors)
                          : (doctorList.length ? doctorList : appointmentDemoDoctors)
                        ).map((doctor) => (
                          <div key={doctor.name} className="rounded-2xl border border-[#dfe9e1] bg-white p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold text-[#17362c]">{doctor.name}</h4>
                              <span className="text-sm font-semibold text-[#19b3a2]">Book</span>
                            </div>
                            <p className="mt-1 text-sm text-[#587068]">{doctor.specialization ?? "General Medicine"}</p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-[.12em] text-[#19b3a2]">{doctor.availability ?? "Next slot 09:00 AM"}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Upcoming</p>
                      <div className="mt-4 space-y-3">
                        {(schedule.length ? schedule : appointmentDemoSchedule).slice(0, 3).map((item) => (
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

            {screen === "billing" && (
              <BillingPage />
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
                  {(doctorList.length ? doctorList : appointmentDemoDoctors).map((doctor) => (
                    <div key={doctor.id ?? doctor.name} className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-[#17362c]">{doctor.name}</p>
                          <p className="text-sm text-[#587068]">{doctor.specialization}</p>
                        </div>
                        <span className="rounded-full bg-[#eaf9f7] px-2.5 py-1 text-xs font-semibold text-[#19b3a2]">Book</span>
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[.12em] text-[#19b3a2]">{doctor.availability}</p>
                      <p className="mt-2 text-sm text-[#587068]">{doctor.email}</p>
                      <p className="mt-1 text-sm text-[#587068]">★ {doctor.rating}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {screen === "patients" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="flex flex-col gap-4 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[.14em] text-[#19b3a2]">Patients</p>
                      <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[#17362c]">Patients</h2>
                      <p className="mt-2 text-sm text-[#587068]">Manage patient records, add new patients and view their details.</p>
                    </div>
                    <button type="button" onClick={() => setShowPatientForm((current) => !current)} className="inline-flex items-center justify-center rounded-2xl bg-[#19b3a2] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(25,179,162,0.2)]">
                      + Add new patient
                    </button>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[1.7fr_repeat(3,minmax(0,0.72fr))_auto]">
                    <label className="flex items-center gap-3 rounded-2xl border border-[#dfe9e1] bg-white px-4 py-3 text-sm text-[#7b8a84] shadow-[0_8px_20px_rgba(19,51,43,0.04)] lg:min-w-0">
                      <Search className="size-4 text-[#9aa8a3]" aria-hidden="true" />
                      <input type="search" placeholder="Search patients by name, phone or email..." className="w-full border-0 bg-transparent text-sm text-[#17362c] placeholder:text-[#9aa8a3] outline-none" />
                    </label>
                    <select className="rounded-2xl border border-[#dfe9e1] bg-white px-4 py-3 text-sm font-semibold text-[#17362c] shadow-[0_8px_20px_rgba(19,51,43,0.04)] outline-none">
                      <option>All status</option>
                      <option>Active</option>
                      <option>New</option>
                      <option>Follow-up</option>
                    </select>
                    <select className="rounded-2xl border border-[#dfe9e1] bg-white px-4 py-3 text-sm font-semibold text-[#17362c] shadow-[0_8px_20px_rgba(19,51,43,0.04)] outline-none">
                      <option>All gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <select className="rounded-2xl border border-[#dfe9e1] bg-white px-4 py-3 text-sm font-semibold text-[#17362c] shadow-[0_8px_20px_rgba(19,51,43,0.04)] outline-none">
                      <option>All doctors</option>
                      <option>Dr. Ananya Rao</option>
                      <option>Dr. Meera Iyer</option>
                      <option>Dr. Priya Sharma</option>
                    </select>
                    <button type="button" className="text-sm font-semibold text-[#587068]">Reset</button>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1180px] text-left text-sm">
                      <thead className="bg-[#f5faf7] text-[#587068]">
                        <tr>
                          <th className="px-4 py-3"><input type="checkbox" aria-label="Select all patients" /></th>
                          <th className="px-4 py-3 font-semibold">#</th>
                          <th className="px-4 py-3 font-semibold">Patient</th>
                          <th className="px-4 py-3 font-semibold">Contact</th>
                          <th className="px-4 py-3 font-semibold">Age / Gender</th>
                          <th className="px-4 py-3 font-semibold">Blood Group</th>
                          <th className="px-4 py-3 font-semibold">Last Visit</th>
                          <th className="px-4 py-3 font-semibold">Next Appointment</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientTableRows.map((row) => (
                          <tr key={row.id} className="border-t border-[#e8eee9] bg-white hover:bg-[#fbfdfb]">
                            <td className="px-4 py-4 align-middle"><input type="checkbox" aria-label={`Select ${row.patient}`} /></td>
                            <td className="px-4 py-4 align-middle text-[#587068]">{row.index}</td>
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="grid size-9 place-items-center rounded-full bg-[#eaf9f7] text-sm font-bold text-[#19b3a2]">{row.avatar}</div>
                                <div>
                                  <p className="font-semibold text-[#17362c]">{row.patient}</p>
                                  <p className="text-xs text-[#587068]">{row.code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle whitespace-pre-line text-[#587068]">{row.contact}</td>
                            <td className="px-4 py-4 align-middle text-[#587068]">{row.ageGender}</td>
                            <td className="px-4 py-4 align-middle text-[#587068]">{row.bloodGroup}</td>
                            <td className="px-4 py-4 align-middle whitespace-pre-line text-[#587068]">{row.lastVisit}</td>
                            <td className="px-4 py-4 align-middle whitespace-pre-line text-[#587068]">{row.nextAppointment}</td>
                            <td className="px-4 py-4 align-middle"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${patientStatusClasses[row.status]}`}>{row.status}</span></td>
                            <td className="px-4 py-4 align-middle"><button type="button" className="rounded-full border border-[#dfe9e1] px-3 py-2 text-xs font-semibold text-[#17362c] hover:border-[#19b3a2] hover:text-[#19b3a2]">•••</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[#e8eee9] px-5 py-4 text-sm text-[#587068] sm:flex-row sm:items-center sm:justify-between">
                    <p>Showing 1 to 10 of 248 patients</p>
                    <div className="flex items-center gap-2">
                      <button type="button" className="grid size-9 place-items-center rounded-xl border border-[#dfe9e1] bg-white text-[#587068]">‹</button>
                      {[1, 2, 3, 4, 5].map((page) => (
                        <button key={page} type="button" className={`grid size-9 place-items-center rounded-xl text-sm font-semibold ${page === 1 ? "bg-[#19b3a2] text-white shadow-[0_10px_20px_rgba(25,179,162,0.22)]" : "border border-[#dfe9e1] bg-white text-[#17362c]"}`}>{page}</button>
                      ))}
                      <span className="px-1 text-[#c1c9c4]">…</span>
                      <button type="button" className="grid size-9 place-items-center rounded-xl border border-[#dfe9e1] bg-white text-[#17362c]">25</button>
                      <button type="button" className="grid size-9 place-items-center rounded-xl border border-[#dfe9e1] bg-white text-[#587068]">›</button>
                    </div>
                  </div>
                </div>

                {showPatientForm && (
                  <div className="mt-5 rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Add new patient</p>
                        <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#17362c]">Quick patient entry</h3>
                      </div>
                      <button type="button" onClick={() => setShowPatientForm(false)} className="text-sm font-semibold text-[#587068]">Hide</button>
                    </div>

                    <form onSubmit={handleAddPatient} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <input value={newPatientForm.name} onChange={(event) => setNewPatientForm({ ...newPatientForm, name: event.target.value })} placeholder="Patient name" className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none" />
                      <input value={newPatientForm.email} onChange={(event) => setNewPatientForm({ ...newPatientForm, email: event.target.value })} type="email" placeholder="Email" className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none" />
                      <input value={newPatientForm.phone} onChange={(event) => setNewPatientForm({ ...newPatientForm, phone: event.target.value })} placeholder="Phone" className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none" />
                      <select value={newPatientForm.doctor} onChange={(event) => setNewPatientForm({ ...newPatientForm, doctor: event.target.value })} className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-3 text-sm text-[#17362c] outline-none">
                        {eligibleDoctors.map((doctor) => (<option key={doctor.name} value={doctor.name}>{doctor.name}</option>))}
                      </select>
                      <button type="submit" className="rounded-xl bg-[#19b3a2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#149d92]">Save patient</button>
                    </form>
                  </div>
                )}
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
