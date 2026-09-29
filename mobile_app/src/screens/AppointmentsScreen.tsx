import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppointmentCard } from "../components/AppointmentCard";
import { bookAppointment, listDoctors, listSlots, type Doctor, type Slot } from "../services/appointments";
import { fetchMobileAiContext, type MobileAIContext } from "../services/ai";

export function AppointmentsScreen({ onBack, token, patientName }: { onBack: () => void; token: string | null; patientName: string }) {
	const [doctor, setDoctor] = useState<Doctor | null>(null);
	const [doctorList, setDoctorList] = useState<Doctor[]>([]);
	const [aiContext, setAiContext] = useState<MobileAIContext | null>(null);
	const [service, setService] = useState("General Consultation");
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	const [slots, setSlots] = useState<Slot[]>([]);
	const [slot, setSlot] = useState<Slot | null>(null);
	const [error, setError] = useState("");
	const [created, setCreated] = useState(false);

	useEffect(() => {
		if (!token) return;

		let active = true;
		fetchMobileAiContext(token, "appointments", patientName)
			.then((context) => {
				if (active) setAiContext(context);
			})
			.catch(() => {
				if (active) setAiContext(null);
			});

		return () => {
			active = false;
		};
	}, [patientName, token]);

	useEffect(() => {
		if (!token) return;
		listDoctors(token)
			.then((doctors) => {
				setDoctorList(doctors);
				const recommendedName = aiContext?.recommended_doctor?.name;
				const recommendedDoctor = recommendedName ? doctors.find((entry) => entry.name === recommendedName) ?? null : null;
				setDoctor(recommendedDoctor ?? doctors[0] ?? null);
			})
			.catch(() => setError("Unable to load clinic doctors."));
	}, [aiContext?.recommended_doctor?.name, token]);

	useEffect(() => {
		if (!token || !doctor || !date) return;

		setSlot(null);
		listSlots(token, doctor.id, date)
			.then((availableSlots) => {
				setSlots(availableSlots);
				setSlot((current) => current ?? availableSlots[0] ?? null);
			})
			.catch(() => setError("Unable to load available slots."));
	}, [token, doctor, date]);

	const aiSignals = aiContext?.signals?.slice(0, 3) ?? ["Live availability", "Context aware", "Approval ready"];
	const aiSummary = aiContext?.summary || "The assistant will preload the first available time as soon as the clinic slots are loaded.";

	async function createAppointment() {
		if (!token || !slot) {
			setError("Select an available appointment slot.");
			return;
		}

		try {
			await bookAppointment(token, slot.id, service);
			setCreated(true);
		} catch {
			setError("That slot is no longer available. Choose another slot.");
		}
	}

	return (
		<SafeAreaView style={styles.page}>
			<ScrollView contentContainerStyle={styles.content}>
				<Pressable onPress={onBack}>
					<Text style={styles.back}>‹ Home</Text>
				</Pressable>
				<Text style={styles.kicker}>BOOK A VISIT</Text>
				<Text style={styles.title}>Create appointment</Text>
				<Text style={styles.copy}>Choose a doctor and a convenient time for your clinic visit.</Text>
				<View style={styles.assistantCard}>
					<Text style={styles.assistantLabel}>AI booking assistant</Text>
					<Text style={styles.assistantTitle}>{doctor ? `Recommended doctor: ${doctor.name}` : "Recommended booking"}</Text>
					<Text style={styles.assistantText}>{aiSummary}</Text>
					<View style={styles.pills}>
						{aiSignals.map((item) => (
							<View key={item} style={styles.pill}>
								<Text style={styles.pillText}>{item}</Text>
							</View>
						))}
					</View>
					{aiContext?.recommended_date ? <Text style={styles.aiMeta}>Best date: {aiContext.recommended_date}</Text> : null}
				</View>
				<View style={styles.recommendation}>
					<Text style={styles.recommendationKicker}>Next best action</Text>
					<Text style={styles.recommendationTitle}>{doctor ? `Start with ${doctor.name}` : "Start with the recommended doctor"}</Text>
					<Text style={styles.recommendationText}>Confirm the preselected slot or switch doctor/date if you want a different appointment window.</Text>
				</View>
				{created ? (
					<View>
						<View style={styles.success}>
							<Text style={styles.successTitle}>Appointment requested</Text>
							<Text style={styles.successText}>{date} · {slot?.start_time}{"\n"}{doctor?.name}{"\n"}{service}</Text>
						</View>
						<AppointmentCard />
					</View>
				) : (
					<View style={styles.form}>
						<Text style={styles.label}>Doctor</Text>
						{doctor ? <Text style={styles.choice}>{doctor.name}</Text> : <Text style={styles.error}>No clinic doctors are available yet.</Text>}
						<Text style={styles.label}>Service</Text>
						<TextInput value={service} onChangeText={setService} style={styles.input} />
						<Text style={styles.label}>Date</Text>
						<TextInput value={date} onChangeText={setDate} style={styles.input} />
						<Text style={styles.label}>Available time</Text>
						<View style={styles.slots}>
							{slots.map((item) => (
								<Pressable key={item.id} onPress={() => setSlot(item)} style={[styles.slot, slot?.id === item.id && styles.selectedSlot]}>
									<Text>{item.start_time}</Text>
								</Pressable>
							))}
						</View>
						{error ? <Text style={styles.error}>{error}</Text> : null}
						<Pressable accessibilityRole="button" onPress={createAppointment} style={styles.button}>
							<Text style={styles.buttonText}>Confirm appointment</Text>
						</Pressable>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	page: { flex: 1, backgroundColor: "#f4faf7" },
	content: { padding: 24, paddingTop: 20, paddingBottom: 40 },
	back: { color: "#0d8f7c", fontSize: 16, fontWeight: "700", marginBottom: 28 },
	kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 },
	title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 14 },
	copy: { color: "#587068", fontSize: 17, lineHeight: 26, marginTop: 12 },
	form: { marginTop: 28 },
	label: { color: "#17362c", fontWeight: "700", marginBottom: 8, marginTop: 16 },
	input: { backgroundColor: "#fff", borderColor: "#c7d5ca", borderRadius: 14, borderWidth: 1, color: "#17362c", fontSize: 16, padding: 16 },
	choice: { backgroundColor: "#eaf5ef", borderRadius: 14, color: "#17362c", fontSize: 16, padding: 16 },
	slots: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
	slot: { backgroundColor: "#fff", borderColor: "#c7d5ca", borderRadius: 12, borderWidth: 1, padding: 12 },
	selectedSlot: { backgroundColor: "#ccefe8", borderColor: "#0d8f7c" },
	error: { color: "#9f1d2f", marginTop: 12, fontWeight: "600" },
	button: { alignItems: "center", backgroundColor: "#0d8f7c", borderRadius: 14, marginTop: 28, padding: 17 },
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
	success: { backgroundColor: "#eaf5ef", borderRadius: 18, marginVertical: 28, padding: 18 },
	successTitle: { color: "#0d8f7c", fontSize: 18, fontWeight: "800" },
	successText: { color: "#17362c", fontSize: 16, lineHeight: 25, marginTop: 10 },
	recommendation: { backgroundColor: "#ffffff", borderColor: "#c7d5ca", borderRadius: 18, borderWidth: 1, marginTop: 18, padding: 18 },
	recommendationKicker: { color: "#0d8f7c", fontSize: 12, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
	recommendationTitle: { color: "#17362c", fontSize: 18, fontWeight: "800", marginTop: 6 },
	recommendationText: { color: "#587068", fontSize: 15, lineHeight: 23, marginTop: 8 },
	assistantCard: { backgroundColor: "#ffffff", borderColor: "#c7d5ca", borderRadius: 18, borderWidth: 1, marginTop: 18, padding: 18 },
	assistantLabel: { color: "#0d8f7c", fontSize: 12, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
	assistantTitle: { color: "#17362c", fontSize: 18, fontWeight: "800", marginTop: 6 },
	assistantText: { color: "#587068", fontSize: 15, lineHeight: 23, marginTop: 8 },
	pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
	pill: { backgroundColor: "#f3faf7", borderColor: "#d7e6df", borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
	pillText: { color: "#17362c", fontSize: 12, fontWeight: "700" },
	aiMeta: { color: "#17362c", marginTop: 10, fontSize: 13, fontWeight: "700" },
});
