import { useState } from "react";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { ScanClinicScreen } from "../screens/ScanClinicScreen";
import { ClinicConfirmScreen } from "../screens/ClinicConfirmScreen";
import { PhoneLoginScreen } from "../screens/PhoneLoginScreen";
import { OTPScreen } from "../screens/OTPScreen";
import { CreateProfileScreen } from "../screens/CreateProfileScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { AppointmentsScreen } from "../screens/AppointmentsScreen";
import type { Clinic } from "../services/clinic";
import { request } from "../services/api";
import { authStore } from "../store/authStore";

type Screen = "welcome" | "scan" | "confirm" | "phone" | "otp" | "profile" | "home" | "appointments";

export function AppNavigator() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [phone, setPhone] = useState("");
  const [clinic, setClinic] = useState<Clinic | null>(null);

  if (screen === "welcome") return <WelcomeScreen onStart={() => setScreen("scan")} />;
  if (screen === "scan") return <ScanClinicScreen onClinicFound={(nextClinic) => { setClinic(nextClinic); setScreen("confirm"); }} />;
  if (screen === "confirm" && clinic) return <ClinicConfirmScreen clinic={clinic} onContinue={() => setScreen("phone")} onBack={() => setScreen("scan")} />;
  if (screen === "phone") return <PhoneLoginScreen phone={phone} onPhoneChange={setPhone} onContinue={() => setScreen("otp")} />;
  if (screen === "otp") return <OTPScreen phone={phone} onVerify={() => setScreen("profile")} onBack={() => setScreen("phone")} />;
  if (screen === "profile") return <CreateProfileScreen onComplete={async (profile) => {
    if (!clinic) throw new Error("Scan a clinic QR code before creating an account.");
    const clinicSlug = clinic.publicSlug;
    const response = await request<{ access_token: string }>(`/api/public/clinics/${encodeURIComponent(clinicSlug)}/patients/register`, { method: "POST", body: JSON.stringify({ ...profile, phone }) });
    authStore.token = response.access_token;
    authStore.patientName = profile.name;
    setScreen("home");
  }} />;
  if (screen === "appointments") return <AppointmentsScreen token={authStore.token} onBack={() => setScreen("home")} />;
  return <HomeScreen clinic={clinic ?? { id: "", publicSlug: "", name: "Thinkare" }} onAppointmentsPress={() => setScreen("appointments")} />;
}
