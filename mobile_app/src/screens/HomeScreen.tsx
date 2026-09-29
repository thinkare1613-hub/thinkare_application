import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppointmentCard } from "../components/AppointmentCard";
import { ClinicCard } from "../components/ClinicCard";
import type { Clinic } from "../services/clinic";
import { fetchMobileAiContext, type MobileAIContext } from "../services/ai";

export function HomeScreen({ clinic, patientName, token, onAppointmentsPress, onShowcasePress }: { clinic: Clinic; patientName: string; token: string | null; onAppointmentsPress: () => void; onShowcasePress: () => void }) {
  const [aiContext, setAiContext] = useState<MobileAIContext | null>(null);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (!token) return;

    let active = true;
    setAiError("");

    fetchMobileAiContext(token, "dashboard", patientName)
      .then((context) => {
        if (active) setAiContext(context);
      })
      .catch((error) => {
        if (active) setAiError(error instanceof Error ? error.message : "Unable to load AI context.");
      });

    return () => {
      active = false;
    };
  }, [patientName, token]);

  const aiSignals = aiContext?.signals?.slice(0, 3) ?? ["Clinic-scoped context", "Live booking availability", "Records and reminders linked"];
  const aiSummary = aiContext?.summary || "The app keeps appointments, records, and billing tied to this clinic and shows the most useful next step first.";
  const primaryActionLabel = aiContext?.suggested_actions?.[0] || "Continue with AI booking";

  return (
    <View style={styles.page}>
      <Text style={styles.kicker}>THINKARE PATIENT</Text>
      <Text style={styles.title}>Good morning, {patientName}</Text>
      <Text style={styles.clinic}>{clinic.name}</Text>

      <View style={styles.aiCard}>
        <Text style={styles.aiLabel}>AI next best action</Text>
        <Text style={styles.aiText}>{aiSummary}</Text>
        <View style={styles.pills}>
          {aiSignals.map((signal) => (
            <View key={signal} style={styles.pill}>
              <Text style={styles.pillText}>{signal}</Text>
            </View>
          ))}
        </View>
        {aiContext?.recommended_doctor?.name ? <Text style={styles.recommendation}>Recommended doctor: {aiContext.recommended_doctor.name}</Text> : null}
        {aiError ? <Text style={styles.error}>{aiError}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Open appointments" onPress={onAppointmentsPress} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressedAction]}>
          <Text style={styles.primaryActionText}>{primaryActionLabel}</Text>
        </Pressable>
      </View>

      <ClinicCard clinic={clinic} />

      <View style={styles.section}>
        <Text style={styles.heading}>Your care</Text>
        <AppointmentCard />
      </View>

      <Text style={styles.heading}>Quick access</Text>
      <View style={styles.grid}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open appointments" onPress={onAppointmentsPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <Text style={styles.tileText}>Appointments</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Open showcase" onPress={onShowcasePress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <Text style={styles.tileText}>Showcase</Text>
        </Pressable>
        {["Records", "Prescriptions", "Billing"].map((item) => (
          <View key={item} style={styles.tile}>
            <Text style={styles.tileText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 24, paddingTop: 64, backgroundColor: "#f4faf7" },
  kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 12 },
  clinic: { color: "#587068", fontSize: 16, marginTop: 6, marginBottom: 14 },
  aiCard: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#d7e6df", padding: 16, marginBottom: 18 },
  aiLabel: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.2, fontSize: 12, textTransform: "uppercase" },
  aiText: { color: "#587068", marginTop: 8, lineHeight: 22, fontSize: 14 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  pill: { backgroundColor: "#f3faf7", borderColor: "#d7e6df", borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  pillText: { color: "#17362c", fontSize: 12, fontWeight: "700" },
  primaryAction: { backgroundColor: "#0d8f7c", borderRadius: 14, marginTop: 16, padding: 14, alignItems: "center" },
  pressedAction: { opacity: 0.8 },
  primaryActionText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  recommendation: { color: "#17362c", marginTop: 12, fontWeight: "700", lineHeight: 20 },
  error: { color: "#9f1d2f", marginTop: 10, fontWeight: "600" },
  section: { marginTop: 26, marginBottom: 26 },
  heading: { color: "#17362c", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47%", backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#d7e6df" },
  pressed: { opacity: 0.75, borderColor: "#0d8f7c" },
  tileText: { color: "#17362c", fontWeight: "700", fontSize: 16 },
});
