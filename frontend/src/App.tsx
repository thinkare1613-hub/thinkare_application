import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { validatePatientDoctorClinicMatch } from "./clinicValidation";
import { validateOtpCode } from "./otpValidation";
import { LoginPage } from "./pages/auth/LoginPage";
import { CreateClinicAccountPage } from "./pages/auth/CreateClinicAccountPage";
import { MedicalRecordsPage } from "./components/medical-records/MedicalRecordsPage";
import { AppointmentForm } from "./components/appointments/AppointmentForm";
import { BillingPage } from "./components/billing/BillingPage";

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

  useEffect(() => {
    const clinicSlug = window.location.pathname.match(/^\/clinic\/([^/]+)$/)?.[1];
    if (!clinicSlug) return;

    fetch(`${apiUrl}/api/public/clinics/${encodeURIComponent(clinicSlug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Clinic booking page not found");
        return response.json();
      })
      .then((clinic) => {
        setClinicProfile((current) => ({
          ...current,
          name: clinic.name,
          address: clinic.address,
          logo: clinic.name.slice(0, 2).toUpperCase(),
        }));
        setAuthMode("patient");
        setScreen("login");
        setMessage(`Welcome to ${clinic.name}. Sign in with your mobile number to book an appointment.`);
      })
      .catch((error: Error) => setMessage(error.message));
  }, []);

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

  function resetRegistrationForm() {
    setClinicName("");
    setAdminName("");
    setPhone("");
    setPassword("");
    setEmail("");
  }

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
      const bookingUrl = data.public_slug ? `${window.location.origin}/clinic/${data.public_slug}` : "";
      setMessage(`Clinic account created for ${data.clinic_name}. Patient booking URL: ${bookingUrl}`);
      resetRegistrationForm();
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
      <LoginPage
        authMode={authMode}
        email={email}
        mobile={mobile}
        otp={otp}
        password={password}
        message={message}
        onAuthModeChange={setAuthMode}
        onEmailChange={setEmail}
        onMobileChange={setMobile}
        onOtpChange={setOtp}
        onPasswordChange={setPassword}
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
                  <div>
                    {assignmentError && (
                      <p className="mb-4 rounded-xl border border-[#f3b3b3] bg-[#fbe9ea] px-4 py-3 text-sm text-[#7a2222]">
                        {assignmentError}
                      </p>
                    )}
                    <AppointmentForm
                      patients={patientList.map((patient) => ({ id: patient.id ?? patient.name, name: patient.name }))}
                      doctors={(currentUserRole === "patient" ? assignedDoctorsForCurrentPatient : doctorList.filter((doctor) => doctor.clinicId === (PATIENT_CLINIC_MAP[bookingForm.patient] ?? CLINIC_ID))).map((doctor) => ({ id: doctor.id ?? doctor.name, name: doctor.name }))}
                      form={bookingForm}
                      onChange={(field, value) => setBookingForm((current) => ({ ...current, [field]: value }))}
                      onSubmit={handleBookingSubmit}
                    />
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
