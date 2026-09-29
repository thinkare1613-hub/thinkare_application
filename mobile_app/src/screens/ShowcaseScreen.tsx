import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type ShowcaseScreenProps = {
  onBack: () => void;
};

const highlights = [
  "Patient booking with live AI guidance",
  "Doctor scheduling and context in one place",
  "Clinic operations and platform oversight",
  "Approval-first actions for sensitive changes",
];

const roleCards = [
  {
    title: "Patient",
    text: "A calmer journey from clinic scan to appointment confirmation with AI next-best-action prompts.",
  },
  {
    title: "Doctor",
    text: "Schedule, visit context, and follow-up decisions stay grouped together for fast review.",
  },
  {
    title: "Clinic admin",
    text: "Manage doctors, patients, availability, and appointments from one operational shell.",
  },
  {
    title: "Platform admin",
    text: "Monitor clinics, payment status, and the wider platform without switching tools.",
  },
];

export function ShowcaseScreen({ onBack }: ShowcaseScreenProps) {
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.kicker}>AI-NATIVE SHOWCASE</Text>
          <Text style={styles.title}>Care, made clear across every role.</Text>
          <Text style={styles.copy}>
            The mobile app now mirrors the AI-native product direction: clearer hierarchy, calmer surfaces, and next-best-action cards that explain why before they act.
          </Text>
        </View>

        <View style={styles.metrics}>
          {[
            { label: "Roles", value: "4" },
            { label: "Screens", value: "Live + showcase" },
            { label: "AI", value: "Context aware" },
          ].map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What this showcases</Text>
          <View style={styles.stack}>
            {highlights.map((item) => (
              <View key={item} style={styles.highlightCard}>
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Role view</Text>
          <View style={styles.stack}>
            {roleCards.map((card) => (
              <View key={card.title} style={styles.roleCard}>
                <Text style={styles.roleTitle}>{card.title}</Text>
                <Text style={styles.roleText}>{card.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Ready for the next step</Text>
          <Text style={styles.footerText}>
            Continue booking, review your clinic context, or go back to the main patient dashboard.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4faf7" },
  content: { padding: 24, paddingBottom: 40 },
  back: { color: "#0d8f7c", fontSize: 16, fontWeight: "700", marginBottom: 20 },
  hero: { backgroundColor: "#fff", borderRadius: 22, borderWidth: 1, borderColor: "#d7e6df", padding: 18 },
  kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.6, fontSize: 12 },
  title: { color: "#17362c", fontSize: 30, fontWeight: "800", marginTop: 10, lineHeight: 36 },
  copy: { color: "#587068", fontSize: 15, lineHeight: 23, marginTop: 10 },
  metrics: { flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" },
  metricCard: { flexGrow: 1, minWidth: "30%", backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#d7e6df", padding: 14 },
  metricValue: { color: "#17362c", fontSize: 20, fontWeight: "800" },
  metricLabel: { color: "#587068", fontSize: 12, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 },
  section: { marginTop: 18 },
  sectionLabel: { color: "#19b3a2", fontSize: 12, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 },
  stack: { gap: 10 },
  highlightCard: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#d7e6df", padding: 16 },
  highlightText: { color: "#17362c", fontSize: 15, fontWeight: "600", lineHeight: 22 },
  roleCard: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#d7e6df", padding: 16 },
  roleTitle: { color: "#17362c", fontSize: 16, fontWeight: "800" },
  roleText: { color: "#587068", fontSize: 14, lineHeight: 22, marginTop: 6 },
  footerCard: { marginTop: 18, backgroundColor: "#eaf5ef", borderRadius: 18, padding: 16 },
  footerTitle: { color: "#0d8f7c", fontSize: 16, fontWeight: "800" },
  footerText: { color: "#17362c", fontSize: 14, lineHeight: 22, marginTop: 6 },
});