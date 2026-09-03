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

type Screen = "welcome" | "scan" | "confirm" | "phone" | "otp" | "profile" | "home" | "appointments";

export function AppNavigator() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [phone, setPhone] = useState("");
  const [clinic, setClinic] = useState<Clinic>({ id: "clinic-demo-1", name: "ABC Dental Clinic", city: "Bengaluru", address: "MG Road, Bengaluru", verified: true });

  if (screen === "welcome") return <WelcomeScreen onStart={() => setScreen("scan")} />;
  if (screen === "scan") return <ScanClinicScreen onClinicFound={(nextClinic) => { setClinic(nextClinic); setScreen("confirm"); }} />;
  if (screen === "confirm") return <ClinicConfirmScreen clinic={clinic} onContinue={() => setScreen("phone")} onBack={() => setScreen("scan")} />;
  if (screen === "phone") return <PhoneLoginScreen phone={phone} onPhoneChange={setPhone} onContinue={() => setScreen("otp")} />;
  if (screen === "otp") return <OTPScreen phone={phone} onVerify={() => setScreen("profile")} onBack={() => setScreen("phone")} />;
  if (screen === "profile") return <CreateProfileScreen onComplete={() => setScreen("home")} />;
  if (screen === "appointments") return <AppointmentsScreen onBack={() => setScreen("home")} />;
  return <HomeScreen clinic={clinic} onAppointmentsPress={() => setScreen("appointments")} />;
}
