import { useState } from "react";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { ScanClinicScreen } from "../screens/ScanClinicScreen";
import { ClinicConfirmScreen } from "../screens/ClinicConfirmScreen";
import { PhoneLoginScreen } from "../screens/PhoneLoginScreen";
import { OTPScreen } from "../screens/OTPScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { AppointmentsScreen } from "../screens/AppointmentsScreen";
import { ShowcaseScreen } from "../screens/ShowcaseScreen";
import type { Clinic } from "../services/clinic";
import { authStore } from "../store/authStore";
import { sendPatientOtp, verifyPatientOtp } from "../services/auth";

type Screen = "welcome" | "scan" | "confirm" | "phone" | "otp" | "home" | "appointments" | "showcase";

export function AppNavigator() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [phone, setPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sentOtp, setSentOtp] = useState("");
  const [clinic, setClinic] = useState<Clinic | null>(null);

  if (screen === "welcome") return <WelcomeScreen onStart={() => setScreen("scan")} />;
  if (screen === "scan") return <ScanClinicScreen onClinicFound={(nextClinic) => { setClinic(nextClinic); setScreen("confirm"); }} />;
  if (screen === "confirm" && clinic) return <ClinicConfirmScreen clinic={clinic} onContinue={() => setScreen("phone")} onBack={() => setScreen("scan")} />;
  if (screen === "phone") return <PhoneLoginScreen phone={phone} patientName={patientName} onPhoneChange={setPhone} onPatientNameChange={setPatientName} onContinue={async () => {
    if (!clinic) throw new Error("Scan a clinic QR code before continuing.");
    if (!patientName.trim()) throw new Error("Enter your name before continuing.");
    if (!phone.trim()) throw new Error("Enter your mobile number before continuing.");

    const response = await sendPatientOtp(clinic.publicSlug, phone, patientName);
    setSentOtp(response.otp);
    setOtpSent(true);
    setScreen("otp");
  }} />;
  if (screen === "otp") return <OTPScreen phone={phone} sentOtp={sentOtp} onVerify={async (otp: string) => {
    if (!clinic) throw new Error("Scan a clinic QR code before continuing.");
    if (!otpSent) throw new Error("Request OTP first.");

    const response = await verifyPatientOtp(clinic.publicSlug, phone, otp);

    authStore.token = response.access_token;
    authStore.patientName = response.user.name ?? patientName.trim();
    setScreen("home");
  }} onBack={() => setScreen("phone")} />;
  if (screen === "appointments") return <AppointmentsScreen token={authStore.token} patientName={authStore.patientName ?? ""} onBack={() => setScreen("home")} />;
  if (screen === "showcase") return <ShowcaseScreen onBack={() => setScreen("home")} />;
  return <HomeScreen clinic={clinic ?? { id: "", publicSlug: "", name: "Thinkare" }} patientName={authStore.patientName ?? "there"} token={authStore.token} onAppointmentsPress={() => setScreen("appointments")} onShowcasePress={() => setScreen("showcase")} />;
}
