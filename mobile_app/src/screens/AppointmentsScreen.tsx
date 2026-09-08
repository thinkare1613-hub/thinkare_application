import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppointmentCard } from "../components/AppointmentCard";
import { bookAppointment, listDoctors, listSlots, type Doctor, type Slot } from "../services/appointments";

 export function AppointmentsScreen({ onBack, token }: { onBack: () => void; token: string | null }) {
	 const [doctor, setDoctor] = useState<Doctor | null>(null);
	 const [service, setService] = useState("General Consultation");
	 const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	 const [slots, setSlots] = useState<Slot[]>([]);
	 const [slot, setSlot] = useState<Slot | null>(null);
	 const [error, setError] = useState("");
	 const [created, setCreated] = useState(false);

	 useEffect(() => {
		if (!token) return;
		listDoctors(token).then((doctors) => setDoctor(doctors[0] ?? null)).catch(() => setError("Unable to load clinic doctors."));
	 }, [token]);

	 useEffect(() => {
		if (!token || !doctor || !date) return;
		setSlot(null);
		listSlots(token, doctor.id, date).then(setSlots).catch(() => setError("Unable to load available slots."));
	 }, [token, doctor, date]);

	 async function createAppointment() {
		if (!token || !slot) { setError("Select an available appointment slot."); return; }
		try { await bookAppointment(token, slot.id, service); setCreated(true); } catch { setError("That slot is no longer available. Choose another slot."); }
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
						 <View style={styles.slots}>{slots.map((item) => <Pressable key={item.id} onPress={() => setSlot(item)} style={[styles.slot, slot?.id === item.id && styles.selectedSlot]}><Text>{item.start_time}</Text></Pressable>)}</View>
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
	 successText: { color: "#17362c", fontSize: 16, lineHeight: 25, marginTop: 10 }
 });
