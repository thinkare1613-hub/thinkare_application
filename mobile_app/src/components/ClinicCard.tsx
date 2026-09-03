import { StyleSheet, Text, View } from "react-native";
import type { Clinic } from "../services/clinic";

export function ClinicCard({ clinic }: { clinic: Clinic }) {
  return <View style={styles.card}><Text style={styles.icon}>+</Text><View style={styles.copy}><Text style={styles.name}>{clinic.name}</Text><Text style={styles.meta}>{clinic.address ?? clinic.city}</Text><Text style={styles.verified}>✓ Verified Thinkare Clinic</Text></View></View>;
}
const styles = StyleSheet.create({ card: { flexDirection: "row", gap: 16, backgroundColor: "#eef8f4", borderRadius: 20, padding: 18 }, icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#0d8f7c", color: "#fff", fontSize: 32, textAlign: "center", lineHeight: 48 }, copy: { flex: 1 }, name: { color: "#17362c", fontSize: 18, fontWeight: "700" }, meta: { color: "#587068", marginTop: 4 }, verified: { color: "#0d8f7c", fontWeight: "600", marginTop: 10 } });
