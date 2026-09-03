import { StyleSheet, Text, View } from "react-native";
import { MedicalRecordCard } from "../components/MedicalRecordCard";
export function MedicalRecordsScreen() { return <View style={styles.page}><Text style={styles.kicker}>YOUR HEALTH</Text><Text style={styles.title}>Medical records</Text><View style={styles.content}><MedicalRecordCard title="Annual health review" category="VISIT SUMMARY" date="Sep 02, 2026" /></View></View>; }
const styles = StyleSheet.create({ page: { flex: 1, padding: 24, paddingTop: 70, backgroundColor: "#f4faf7" }, kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 }, title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 14 }, content: { marginTop: 28 } });
