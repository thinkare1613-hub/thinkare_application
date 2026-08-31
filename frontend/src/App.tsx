import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { validatePatientDoctorClinicMatch } from "./clinicValidation";
import { validateOtpCode } from "./otpValidation";

type Screen = "login" | "register" | "dashboard" | "care_team" | "appointments" | "medical_records" | "prescriptions" | "patients" | "doctors" | "clinics" | "availability" | "billing" | "notifications" | "profile";
type AuthMode = "clinic_admin" | "patient";
type UserRole = "clinic_admin" | "doctor" | "patient";

type Appointment = {
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

const CLINIC_ID = "clinic-demo-1";

const DOCTOR_CLINIC_MAP: Record<string, string> = {
  "Dr. Ananya Rao": CLINIC_ID,
  "Dr. Kabir Menon": CLINIC_ID,
  "Dr. Aisha Patel": CLINIC_ID,
  "Dr. Rahul Bose": CLINIC_ID,
};

const PATIENT_CLINIC_MAP: Record<string, string> = {
  "Aarav Sharma": CLINIC_ID,
  "Meera Iyer": CLINIC_ID,
  "Kabir Khan": CLINIC_ID,
  "Naina Verma": CLINIC_ID,
};

const PATIENT_DOCTOR_ASSIGNMENTS: Record<string, string[]> = {
  "Bhavani Patient": ["Dr. Ananya Rao"],
  "Aarav Sharma": ["Dr. Ananya Rao"],
  "Meera Iyer": ["Dr. Kabir Menon"],
  "Kabir Khan": ["Dr. Aisha Patel"],
  "Naina Verma": ["Dr. Rahul Bose"],
};

const initialAppointments: Appointment[] = [
  { time: "09:00 AM", patient: "Aarav Sharma", doctor: "Dr. Ananya Rao", service: "Consultation", status: "Confirmed" },
  { time: "10:30 AM", patient: "Meera Iyer", doctor: "Dr. Kabir Menon", service: "Follow-up", status: "Waiting" },
  { time: "12:00 PM", patient: "Kabir Khan", doctor: "Dr. Aisha Patel", service: "Consultation", status: "In progress" },
  { time: "02:15 PM", patient: "Naina Verma", doctor: "Dr. Rahul Bose", service: "Check-up", status: "Completed" },
  { time: "03:30 PM", patient: "Zoya Ali", doctor: "Dr. Saanvi Nair", service: "Consultation", status: "Cancelled" },
];

const initialDoctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Ananya Rao",
    email: "ananya@abcdental.com",
    phone: "+91 98765 12345",
    specialization: "Cardiology",
    qualification: "MD (Cardiology)",
    licenseNumber: "KMC-CRD-2048",
    experience: "12 years",
    profilePhoto: "AR",
    consultationFee: 1200,
    status: "Available",
    availability: "Available today",
    rating: 4.9,
    clinicId: CLINIC_ID,
  },
  {
    id: "doc-2",
    name: "Dr. Kabir Menon",
    email: "kabir@abcdental.com",
    phone: "+91 98765 67890",
    specialization: "Dermatology",
    qualification: "MBBS, MD (Dermatology)",
    licenseNumber: "KMC-DER-1176",
    experience: "9 years",
    profilePhoto: "KM",
    consultationFee: 950,
    status: "Available",
    availability: "Next slot 1:00 PM",
    rating: 4.8,
    clinicId: CLINIC_ID,
  },
  {
    id: "doc-3",
    name: "Dr. Aisha Patel",
    email: "aisha@abcdental.com",
    phone: "+91 98765 45210",
    specialization: "Pediatrics",
    qualification: "MBBS, DCH",
    licenseNumber: "KMC-PED-3301",
    experience: "11 years",
    profilePhoto: "AP",
    consultationFee: 850,
    status: "Booked",
    availability: "Available today",
    rating: 5.0,
    clinicId: CLINIC_ID,
  },
  {
    id: "doc-4",
    name: "Dr. Rahul Bose",
    email: "rahul@abcdental.com",
    phone: "+91 98765 99876",
    specialization: "Orthopedics",
    qualification: "MS (Orthopedics)",
    licenseNumber: "KMC-ORT-4810",
    experience: "14 years",
    profilePhoto: "RB",
    consultationFee: 1100,
    status: "On leave",
    availability: "Next slot 3:30 PM",
    rating: 4.7,
    clinicId: CLINIC_ID,
  },
];

const initialPatients: Patient[] = [
  { id: "patient-1", name: "Aarav Sharma", email: "aarav@gmail.com", phone: "+1 415 890 7712", lastVisit: "2 days ago", clinicId: CLINIC_ID },
  { id: "patient-2", name: "Meera Iyer", email: "meera@gmail.com", phone: "+1 425 810 2856", lastVisit: "4 days ago", clinicId: CLINIC_ID },
  { id: "patient-3", name: "Kabir Khan", email: "kabir@gmail.com", phone: "+1 510 621 4449", lastVisit: "1 week ago", clinicId: CLINIC_ID },
  { id: "patient-4", name: "Naina Verma", email: "naina@gmail.com", phone: "+1 602 745 2200", lastVisit: "Today", clinicId: CLINIC_ID },
];

const summaryCards = [
  { label: "Today", value: "24", tone: "bg-[#19b3a2] text-white" },
  { label: "Confirmed", value: "6", tone: "bg-[#eaf5ef] text-[#0d523e]" },
  { label: "Waiting", value: "2", tone: "bg-[#fff7e9] text-[#8a5e00]" },
  { label: "Completed", value: "3", tone: "bg-[#edf3ff] text-[#1f3d7a]" },
];

const quickActions = ["+ New appointment", "Patients", "Doctors", "Schedule"];

const pageMeta: Record<Exclude<Screen, "login" | "register">, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of patient flow and clinic performance." },
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
  const [authMode, setAuthMode] = useState<AuthMode>("clinic_admin");
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("clinic_admin");
  const [email, setEmail] = useState("admin@gmail.com");
  const [mobile, setMobile] = useState("+91 98765 43210");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("admin@123");
  const [clinicName, setClinicName] = useState("ABC Dental Clinic");
  const [adminName, setAdminName] = useState("Dr. John Smith");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [message, setMessage] = useState("");
  const [clinicProfile, setClinicProfile] = useState({
    name: "ABC Dental Clinic",
    admin: "Dr. John Smith",
    email: "hello@abcdental.com",
    phone: "+91 98765 43210",
    address: "MG Road, Bengaluru",
    logo: "AB",
  });
  const [registeredClinics, setRegisteredClinics] = useState<Record<string, typeof clinicProfile>>({
    "admin@gmail.com": {
      name: "ABC Dental Clinic",
      admin: "Dr. John Smith",
      email: "admin@gmail.com",
      phone: "+91 98765 43210",
      address: "MG Road, Bengaluru",
      logo: "AB",
    },
    "bhavani@gmail.com": {
      name: "Bhavani Clinic",
      admin: "Bhavani",
      email: "bhavani@gmail.com",
      phone: "+91 9787847603",
      address: "MG Road, Bengaluru",
      logo: "BC",
    },
  });
  const [patientAccounts, setPatientAccounts] = useState<Record<string, { name: string; clinicEmail: string; clinicName: string; password: string; clinicId: string; phone: string }>>({
    "bhavani.patient@gmail.com": {
      name: "Bhavani Patient",
      clinicEmail: "bhavani@gmail.com",
      clinicName: "Bhavani Clinic",
      password: "patient@123",
      clinicId: CLINIC_ID,
      phone: "+91 98765 43210",
    },
  });

  function applyClinicProfile(nextProfile: Partial<typeof clinicProfile> & { name?: string; admin?: string; email?: string; phone?: string; address?: string; logo?: string }) {
    setClinicProfile((current) => ({
      ...current,
      name: nextProfile.name ?? current.name,
      admin: nextProfile.admin ?? current.admin,
      email: nextProfile.email ?? current.email,
      phone: nextProfile.phone ?? current.phone,
      address: nextProfile.address ?? current.address,
      logo: nextProfile.logo ?? current.logo,
    }));
  }
  const [doctorList, setDoctorList] = useState<Doctor[]>(initialDoctors);
  const [patientList, setPatientList] = useState<Patient[]>(initialPatients);
  const [selectedPatientName, setSelectedPatientName] = useState(initialPatients[0].name);
  const [schedule, setSchedule] = useState<Appointment[]>(initialAppointments);
  const [bookingForm, setBookingForm] = useState({
    patient: "Aarav Sharma",
    doctor: "Dr. Ananya Rao",
    service: "Consultation",
    date: "2026-08-30",
    time: "09:00 AM",
  });
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctors[0]?.id ?? "");
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
    doctor: "Dr. Ananya Rao",
  });

  const selectedPatient = patientList.find((entry) => entry.name === selectedPatientName) ?? patientList[0];
  const assignedDoctorsForCurrentPatient = useMemo(() => {
    const patientName = selectedPatient?.name ?? "Bhavani Patient";
    const assignedDoctors = PATIENT_DOCTOR_ASSIGNMENTS[patientName] ?? [doctorList[0]?.name ?? "Dr. Ananya Rao"];

    if (currentUserRole !== "patient") {
      return doctorList.filter((doctor) => assignedDoctors.includes(doctor.name));
    }

    return doctorList.filter((doctor) => assignedDoctors.includes(doctor.name));
  }, [currentUserRole, doctorList, selectedPatient]);

  const eligibleDoctors = useMemo(() => {
    if (!selectedPatient) {
      return doctorList;
    }

    if (currentUserRole === "patient") {
      return assignedDoctorsForCurrentPatient;
    }

    return doctorList.filter((doctor) => doctor.clinicId === selectedPatient.clinicId || !doctor.clinicId || !selectedPatient.clinicId);
  }, [assignedDoctorsForCurrentPatient, currentUserRole, doctorList, selectedPatient]);

  function handleSignOut() {
    setCurrentUserRole("clinic_admin");
    setOtp("");
    setMobile("+91 98765 43210");
    setScreen("login");
    setMessage("You have been signed out.");
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authMode === "patient") {
      const otpError = validateOtpCode(otp);
      if (otpError) {
        setMessage(otpError);
        return;
      }

      const patientEmail = (email || "").trim().toLowerCase();
      const directPatient = patientEmail ? patientAccounts[patientEmail] : undefined;
      const patientByPhone = Object.values(patientAccounts).find((entry) => entry.phone === mobile);
      const resolvedPatient = directPatient ?? patientByPhone;

      if (!resolvedPatient) {
        setMessage("Patient account not found for this clinic.");
        return;
      }

      if (resolvedPatient.password !== password && otp !== "123456") {
        setMessage("Incorrect patient password or OTP.");
        return;
      }

      const clinic = registeredClinics[resolvedPatient.clinicEmail] ?? {
        name: resolvedPatient.clinicName,
        admin: resolvedPatient.clinicName,
        email: resolvedPatient.clinicEmail,
        phone: resolvedPatient.phone || "+91 00000 00000",
        address: "Clinic address",
        logo: resolvedPatient.clinicName.slice(0, 2).toUpperCase(),
      };

      setClinicProfile({
        name: clinic.name,
        admin: clinic.admin,
        email: clinic.email,
        phone: clinic.phone,
        address: clinic.address,
        logo: clinic.logo,
      });
      setCurrentUserRole("patient");
      setSelectedPatientName(resolvedPatient.name);
      setMessage(`Welcome, ${resolvedPatient.name}. OTP verified successfully.`);
      setScreen("dashboard");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Sign in failed");
      }

      const data = await response.json();
      const clinicNameFromServer = data.user?.clinic_name || "Clinic Workspace";

      if (registeredClinics[email]) {
        const savedClinic = registeredClinics[email];
        setClinicProfile({
          name: savedClinic.name,
          admin: savedClinic.admin,
          email: savedClinic.email,
          phone: savedClinic.phone,
          address: savedClinic.address,
          logo: savedClinic.logo,
        });
      } else {
        applyClinicProfile({
          name: clinicNameFromServer,
          admin: adminName,
          email,
          phone,
          logo: clinicNameFromServer.slice(0, 2).toUpperCase() || "CL",
        });
      }

      setCurrentUserRole("clinic_admin");
      setMessage(`Welcome back, ${clinicNameFromServer}.`);
      setScreen("dashboard");
    } catch {
      setMessage("Unable to sign in. Confirm the FastAPI backend is running.");
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

      const nextProfile = {
        name: clinicName,
        admin: adminName,
        email: data.email || email,
        phone: phone || "+91 00000 00000",
        address: "MG Road, Bengaluru",
        logo: clinicName.slice(0, 2).toUpperCase() || "CL",
      };

      setRegisteredClinics((current) => ({
        ...current,
        [nextProfile.email]: nextProfile,
      }));
      setClinicProfile(nextProfile);
      setPatientAccounts((current) => ({
        ...current,
        "bhavani.patient@gmail.com": {
          name: "Bhavani Patient",
          clinicEmail: nextProfile.email,
          clinicName: nextProfile.name,
          password: "patient@123",
          clinicId: CLINIC_ID,
          phone: phone || "+91 90000 00000",
        },
      }));
      setCurrentUserRole("clinic_admin");
      setMessage(`Clinic account created for ${data.clinic_name}. Please sign in.`);
      setEmail(data.email);
      setPassword("");
      setScreen("login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Clinic registration failed.");
    }
  }

  function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const patientClinicId = PATIENT_CLINIC_MAP[bookingForm.patient] ?? CLINIC_ID;
    const doctorClinicId = DOCTOR_CLINIC_MAP[bookingForm.doctor] ?? CLINIC_ID;
    const validationError = validatePatientDoctorClinicMatch(patientClinicId, doctorClinicId);

    if (validationError) {
      setAssignmentError(validationError);
      setMessage(validationError);
      return;
    }

    setAssignmentError(null);

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

  function handleAddDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const doctorName = newDoctorForm.name.trim();
    if (!doctorName) return;

    const doctorPayload: Doctor = {
      id: editingDoctorId ?? `doc-${Date.now()}`,
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
      clinicId: CLINIC_ID,
    };

    setDoctorList((current) => {
      if (editingDoctorId) {
        return current.map((doctor) => (doctor.id === editingDoctorId ? doctorPayload : doctor));
      }
      return [doctorPayload, ...current];
    });

    setSelectedDoctorId(doctorPayload.id ?? "");
    setMessage(
      editingDoctorId
        ? `${doctorPayload.name} was updated successfully.`
        : `${doctorPayload.name} was added to the clinic team.`,
    );
    resetDoctorForm();
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

  function handleDeleteDoctor(doctorId: string | undefined) {
    if (!doctorId) return;
    const doctor = doctorList.find((entry) => entry.id === doctorId);
    if (!doctor) return;
    const confirmed = window.confirm(`Delete ${doctor.name} from this clinic?`);
    if (!confirmed) return;

    setDoctorList((current) => current.filter((entry) => entry.id !== doctorId));
    if (selectedDoctorId === doctorId) {
      const nextDoctor = doctorList.find((entry) => entry.id !== doctorId);
      setSelectedDoctorId(nextDoctor?.id ?? "");
    }
    if (editingDoctorId === doctorId) {
      resetDoctorForm();
    }
    setMessage(`${doctor.name} was removed from the clinic team.`);
  }

  function handleAddPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPatientForm.name.trim()) return;

    const selectedDoctorClinicId = DOCTOR_CLINIC_MAP[newPatientForm.doctor] ?? CLINIC_ID;
    const validationError = validatePatientDoctorClinicMatch(CLINIC_ID, selectedDoctorClinicId);

    if (validationError) {
      setAssignmentError(validationError);
      setMessage(validationError);
      return;
    }

    const patientEmail = (newPatientForm.email || `${newPatientForm.name.trim().toLowerCase().replace(/\s+/g, ".")}@clinic.com`).toLowerCase();
    const patientPassword = "patient@123";
    const addedPatient: Patient = {
      name: newPatientForm.name.trim(),
      email: patientEmail,
      phone: newPatientForm.phone || "+91 90000 00000",
      lastVisit: "Today",
      clinicId: CLINIC_ID,
    };

    setAssignmentError(null);
    setPatientAccounts((current) => ({
      ...current,
      [patientEmail]: {
        name: addedPatient.name,
        clinicEmail: email || "bhavani@gmail.com",
        clinicName: clinicProfile.name || "Bhavani Clinic",
        password: patientPassword,
        clinicId: CLINIC_ID,
        phone: addedPatient.phone,
      },
    }));
    setPatientList((current) => [addedPatient, ...current]);
    setSelectedPatientName(addedPatient.name);
    setMessage(`${addedPatient.name} was added and assigned to ${newPatientForm.doctor}. Patient login: ${patientEmail} / ${patientPassword}`);
    setNewPatientForm({ name: "", email: "", phone: "", lastVisit: "Today", doctor: "Dr. Ananya Rao" });
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
      <main className="min-h-screen bg-[#e8f1ee] text-[#17362c]">
        <section className="grid min-h-screen w-full lg:grid-cols-[1.08fr_0.92fr]">
<div className="bg-[#19b3a2] px-6 pb-8 pt-8 text-white sm:px-12 lg:px-14 lg:pb-12 lg:pt-12">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/10 backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
                    <path d="M12 21c4.5-2.7 7.5-6.2 7.5-10.8A4.7 4.7 0 0 0 14.8 5.5c-1.1 0-2.1.4-2.9 1.2A4.1 4.1 0 0 0 9 5.5 4.7 4.7 0 0 0 4.5 10.2C4.5 14.8 7.5 18.3 12 21Z" />
                    <path d="M10 10.5c.6-1 1.5-1.5 2.5-1.5 1.1 0 2 .6 2.5 1.5" />
                    <path d="M9 16.5h6" />
                  </svg>
                </div>
                <span className="text-[1.8rem] font-bold tracking-[-0.04em] sm:text-[2.1rem]">Thinkare</span>
              </div>

              <div className="mt-10 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 shadow-sm backdrop-blur-sm sm:mt-16 sm:text-lg">
                <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-white" />
                Multi-tenant Healthcare Platform
              </div>

              <h1 className="mt-8 max-w-[620px] text-[2.8rem] font-bold leading-[0.96] tracking-[-0.06em] text-white sm:mt-12 sm:text-[4.2rem]">
                One platform for
                <span className="mt-2 block">many clinics</span>
              </h1>

              <p className="mt-6 max-w-[620px] text-base leading-[1.6] text-white/90 sm:mt-8 sm:text-[1.25rem]">
              Clinic owners can create their own workspace, upload a logo, manage doctors and patients, and keep data isolated inside their own tenant.
            </p>

            <div className="mt-14 grid max-w-[560px] grid-cols-3 gap-4 text-white">
              <div>
                <div className="text-[3rem] font-bold tracking-[-0.06em]">100+</div>
                <div className="mt-1 text-[1.03rem] text-white/85">Clinic Workspaces</div>
              </div>
              <div>
                <div className="text-[3rem] font-bold tracking-[-0.06em]">50K+</div>
                <div className="mt-1 text-[1.03rem] text-white/85">Patients Managed</div>
              </div>
              <div>
                <div className="text-[3rem] font-bold tracking-[-0.06em]">24/7</div>
                <div className="mt-1 text-[1.03rem] text-white/85">Operational Access</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#f2f5f3] px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-[560px]">
              <h2 className="text-[3.2rem] font-bold tracking-[-0.06em] text-[#1d2d2a]">Welcome back</h2>
              <p className="mt-3 text-[1.15rem] text-[#5c6664]">{authMode === "clinic_admin" ? "Sign in to your clinic dashboard" : "Sign in with mobile and OTP for your clinic"}</p>

              <div className="mt-6 flex rounded-2xl border border-[#d8e2d9] bg-white p-1.5">
                {(["clinic_admin", "patient"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAuthMode(mode)}
                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${authMode === mode ? "bg-[#19b3a2] text-white shadow" : "text-[#587068]"}`}
                  >
                    {mode === "clinic_admin" ? "Clinic admin" : "Patient"}
                  </button>
                ))}
              </div>

              <form onSubmit={login} className="mt-8">
                {authMode === "clinic_admin" ? (
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
                        placeholder="clinic@domain.com"
                        className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                      />
                    </div>
                  </label>
                ) : (
                  <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                    Mobile number
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                        <path d="M11 18.5h2" />
                      </svg>
                      <input
                        value={mobile}
                        onChange={(event) => setMobile(event.target.value)}
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                      />
                    </div>
                  </label>
                )}

                {authMode === "patient" && (
                  <div className="mt-7">
                    <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                      OTP
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                          <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                          <rect x="5" y="10" width="14" height="9" rx="2" />
                        </svg>
                        <input
                          value={otp}
                          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                          required
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="123456"
                          className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                        />
                      </div>
                    </label>
                  </div>
                )}

                {authMode === "clinic_admin" && (
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
                        placeholder={authMode === "clinic_admin" ? "Enter your password" : "Enter clinic password or OTP fallback"}
                        className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                      />
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </div>
                )}

                <label className="mt-6 flex items-center gap-3 text-[1rem] text-[#2b3d3a]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#cbd6d2] accent-[#19b3a2]" />
                  Remember me for 30 days
                </label>

                <button
                  type="submit"
                  className="mt-8 w-full rounded-xl bg-[#19b3a2] py-4 text-[1.1rem] font-bold text-white shadow-[0_12px_25px_rgba(25,179,162,0.28)] hover:bg-[#14a191]"
                >
                  {authMode === "clinic_admin" ? "Sign In as admin" : "Verify mobile & OTP"}
                </button>
              </form>

              {message && (
                <p className="mt-6 rounded-xl border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm text-[#0d523e]">
                  {message}
                </p>
              )}

              <p className="mt-8 text-center text-[1.03rem] text-[#5c6664]">
                Don&apos;t have a clinic account?{' '}
                <button type="button" onClick={() => setScreen("register")} className="font-semibold text-[#19b3a2] hover:text-[#118f88]">
                  Create clinic account
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "register") {
    return (
      <main className="min-h-screen bg-[#e8f1ee] text-[#17362c]">
        <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#d8e2d9] bg-white p-8 shadow-[0_20px_40px_rgba(18,58,49,0.08)]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#19b3a2]">Thinkare</p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#17362c]">Create clinic account</h2>
              </div>
              <button type="button" onClick={() => setScreen("login")} className="rounded-xl border border-[#d8e2d9] px-3 py-2 text-sm font-medium text-[#17362c]">
                Back to login
              </button>
            </div>

            <form onSubmit={registerClinic} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-semibold text-[#1f352f]">
                  Clinic name
                  <input
                    value={clinicName}
                    onChange={(event) => setClinicName(event.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-[#c7d5ca] bg-[#f8fbfa] px-3 py-3 text-[#17362c] outline-none"
                    placeholder="ABC Dental Clinic"
                  />
                </label>

                <label className="text-sm font-semibold text-[#1f352f]">
                  Admin name
                  <input
                    value={adminName}
                    onChange={(event) => setAdminName(event.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-[#c7d5ca] bg-[#f8fbfa] px-3 py-3 text-[#17362c] outline-none"
                    placeholder="Dr. John Smith"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-semibold text-[#1f352f]">
                  Email
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    className="mt-2 w-full rounded-xl border border-[#c7d5ca] bg-[#f8fbfa] px-3 py-3 text-[#17362c] outline-none"
                    placeholder="clinic@domain.com"
                  />
                </label>

                <label className="text-sm font-semibold text-[#1f352f]">
                  Phone
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#c7d5ca] bg-[#f8fbfa] px-3 py-3 text-[#17362c] outline-none"
                    placeholder="+91 98765 43210"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-[#1f352f]">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  className="mt-2 w-full rounded-xl border border-[#c7d5ca] bg-[#f8fbfa] px-3 py-3 text-[#17362c] outline-none"
                  placeholder="Create a secure password"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#19b3a2] px-4 py-3.5 text-base font-bold text-white shadow-[0_12px_25px_rgba(25,179,162,0.28)] hover:bg-[#14a191]"
              >
                Create clinic account
              </button>
            </form>

            {message && (
              <p className="mt-6 rounded-xl border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm text-[#0d523e]">
                {message}
              </p>
            )}
          </div>
        </section>
      </main>
    );
  }

  const activeMeta = pageMeta[screen as keyof typeof pageMeta];
  const isPatientView = currentUserRole === "patient";
  const patientNavItems = [
    { key: "dashboard", label: "Dashboard", icon: "▣" },
    { key: "care_team", label: "My Doctor / Care Team", icon: "◎" },
    { key: "appointments", label: "Appointments", icon: "◫" },
    { key: "medical_records", label: "Medical Records", icon: "◌" },
    { key: "prescriptions", label: "Prescriptions", icon: "✓" },
    { key: "billing", label: "Payments / Billing", icon: "◍" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "profile", label: "Profile", icon: "◉" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f6f3] text-[#17362c]">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <Sidebar
          activePage={screen}
          onSelectPage={(page) => setScreen(page as Screen)}
          navItems={isPatientView ? patientNavItems : undefined}
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
            {screen === "dashboard" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="flex flex-col gap-5 border-b border-[#d8e2d9] pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[.14em] text-[#19b3a2]">Monday, 30 August</p>
                    <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[#17362c] sm:text-5xl">
                      {isPatientView ? "Patient care dashboard" : "Clinic operations dashboard"}
                    </h2>
                  </div>

                  {!isPatientView && (
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
                  )}
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

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  {(isPatientView
                    ? [
                        { label: "Upcoming visits", value: "2", tone: "bg-[#19b3a2] text-white" },
                        { label: "Care plan", value: "Active", tone: "bg-[#eaf5ef] text-[#0d523e]" },
                        { label: "Records", value: "7", tone: "bg-[#fff7e9] text-[#8a5e00]" },
                        { label: "Prescriptions", value: "3", tone: "bg-[#edf3ff] text-[#1f3d7a]" },
                      ]
                    : summaryCards
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
                  <form onSubmit={handleBookingSubmit} className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                    {assignmentError && (
                      <p className="mb-4 rounded-xl border border-[#f3b3b3] bg-[#fbe9ea] px-4 py-3 text-sm text-[#7a2222]">
                        {assignmentError}
                      </p>
                    )}
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
                          {patientList.map((patient) => (
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
                          {(currentUserRole === "patient"
                            ? assignedDoctorsForCurrentPatient
                            : doctorList.filter((doctor) => doctor.clinicId === (PATIENT_CLINIC_MAP[bookingForm.patient] ?? CLINIC_ID)))
                            .map((doctor) => (
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
                  </aside>
                </div>
              </section>
            )}

            {screen === "medical_records" && (
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="rounded-3xl border border-[#d8e2d9] bg-[#fcfdf9] p-6 shadow-[0_10px_30px_rgba(20,108,82,0.05)]">
                  <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Medical records</p>
                  <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#17362c]">Recent visit history</h3>
                  <div className="mt-6 space-y-4">
                    {[
                      { title: "Consultation summary", date: "12 Aug 2026", detail: "Cardiac review and medication update." },
                      { title: "Lab report", date: "08 Aug 2026", detail: "Routine blood work reviewed by the clinic team." },
                      { title: "Follow-up note", date: "28 Jul 2026", detail: "Plan for continued care and monitoring." },
                    ].map((record) => (
                      <div key={record.title} className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold text-[#17362c]">{record.title}</p>
                          <span className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">{record.date}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#587068]">{record.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
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

                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    {patientList.map((patient) => (
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
                      const patient = patientList.find((entry) => entry.name === selectedPatientName) ?? patientList[0];
                      const upcomingVisit = schedule.find((item) => item.patient === patient.name);

                      return (
                        <>
                          <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Patient profile</p>
                          <div className="mt-5 flex items-center gap-4">
                            <div className="grid size-14 place-items-center rounded-full bg-[#eaf9f7] text-xl font-bold text-[#19b3a2]">
                              {patient.name.slice(0, 1)}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#17362c]">{patient.name}</h3>
                              <p className="text-sm text-[#587068]">Assigned to {(eligibleDoctors[0]?.name ?? newPatientForm.doctor) || "Dr. Ananya Rao"}</p>
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
              <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
                <div className="grid gap-5 md:grid-cols-3">
                  {[
                    { label: "Monthly revenue", value: "$42,560", tone: "bg-[#19b3a2] text-white" },
                    { label: "Outstanding", value: "$8,240", tone: "bg-[#fef3d2] text-[#8a5e00]" },
                    { label: "Collected", value: "$34,320", tone: "bg-[#eaf5ef] text-[#0d523e]" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-3xl p-5 shadow-[0_10px_30px_rgba(20,108,82,0.05)] ${item.tone}`}>
                      <p className="text-sm font-medium opacity-80">{item.label}</p>
                      <p className="mt-3 text-3xl font-bold">{item.value}</p>
                    </div>
                  ))}
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
