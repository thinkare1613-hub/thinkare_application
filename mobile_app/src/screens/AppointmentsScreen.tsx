import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppointmentCard } from "../components/AppointmentCard";
import { bookAppointment, getAvailableSlots, type AppointmentSlot } from "../services/appointments";
 export function AppointmentsScreen({ onBack, doctorId, patientId, token }: { onBack: () => void; doctorId?: string; patientId?: string; token?: string }) {
	 const [doctor, setDoctor] = useState("Dr. Ananya Rao");
	 const [service, setService] = useState("General Consultation");
	 const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	 const [time, setTime] = useState("");
	 const [slots, setSlots] = useState<AppointmentSlot[]>([]);
	 const [picker, setPicker] = useState<"date" | "time" | null>(null);
	 const [error, setError] = useState("");
	 const [created, setCreated] = useState(false);
	 const dateOptions = useMemo(() => Array.from({ length: 14 }, (_, index) => {
		 const nextDate = new Date();
		 nextDate.setDate(nextDate.getDate() + index);
		 return nextDate.toISOString().slice(0, 10);
	 }), []);

	 useEffect(() => {
		 if (!doctorId || !token) return;
		 getAvailableSlots(doctorId, date, token).then((availableSlots) => {
			 setSlots(availableSlots);
			 setTime(availableSlots[0] ? availableSlots[0].start_time : "");
		 }).catch(() => setError("Unable to load available times."));
	 }, [date, doctorId, token]);

	 async function createAppointment() {
		 setError("");
		 const selectedSlot = slots.find((slot) => slot.start_time === time);
		 if (token && patientId && selectedSlot) {
			 try {
				 await bookAppointment(selectedSlot.id, patientId, service, token);
			 } catch {
				 setError("That time is no longer available. Please choose another slot.");
				 return;
			 }
		 } else if (doctorId || patientId || token) {
			 setError("Choose a valid available time before confirming.");
			 return;
		 }
		 setCreated(true);
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
							 <Text style={styles.successText}>{date} · {time}{"\n"}{doctor}{"\n"}{service}</Text>
						 </View>
						 <AppointmentCard />
					 </View>
				 ) : (
					 <View style={styles.form}>
						 <Text style={styles.label}>Doctor</Text>
						 <TextInput value={doctor} onChangeText={setDoctor} style={styles.input} />
						 <Text style={styles.label}>Service</Text>
						 <TextInput value={service} onChangeText={setService} style={styles.input} />
						 <Text style={styles.label}>Date</Text>
						 <Pressable onPress={() => setPicker("date")} style={styles.input}><Text style={styles.inputText}>{date}</Text></Pressable>
						 <Text style={styles.label}>Time</Text>
						 <Pressable onPress={() => setPicker("time")} style={styles.input}><Text style={styles.inputText}>{time || "Select an available time"}</Text></Pressable>
						 {error ? <Text style={styles.error}>{error}</Text> : null}
						 <Pressable accessibilityRole="button" onPress={createAppointment} style={styles.button}>
							 <Text style={styles.buttonText}>Confirm appointment</Text>
						 </Pressable>
					 </View>
				 )}
				 <Modal transparent visible={picker !== null} animationType="slide" onRequestClose={() => setPicker(null)}>
					 <Pressable style={styles.modalBackdrop} onPress={() => setPicker(null)}>
						 <View style={styles.modalSheet}>
							<Text style={styles.modalTitle}>{picker === "date" ? "Choose a date" : "Choose a time"}</Text>
							{(picker === "date" ? dateOptions : slots.map((slot) => slot.start_time)).map((option) => (
								<Pressable key={option} onPress={() => { picker === "date" ? setDate(option) : setTime(option); setPicker(null); }} style={styles.option}>
									<Text style={styles.optionText}>{option}</Text>
								</Pressable>
							))}
						 </View>
					 </Pressable>
				 </Modal>
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
	 input: { backgroundColor: "#fff", borderColor: "#c7d5ca", borderRadius: 14, borderWidth: 1, padding: 16 },
	 inputText: { color: "#17362c", fontSize: 16 },
	 error: { color: "#a33b3b", marginTop: 14 },
	 button: { alignItems: "center", backgroundColor: "#0d8f7c", borderRadius: 14, marginTop: 28, padding: 17 },
	 buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
	 success: { backgroundColor: "#eaf5ef", borderRadius: 18, marginVertical: 28, padding: 18 },
	 successTitle: { color: "#0d8f7c", fontSize: 18, fontWeight: "800" },
	 successText: { color: "#17362c", fontSize: 16, lineHeight: 25, marginTop: 10 }
	 ,modalBackdrop: { backgroundColor: "rgba(23,54,44,0.35)", flex: 1, justifyContent: "flex-end" },
	 modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24 },
	 modalTitle: { color: "#17362c", fontSize: 20, fontWeight: "800", marginBottom: 12 },
	 option: { borderBottomColor: "#e4ece7", borderBottomWidth: 1, paddingVertical: 16 },
	 optionText: { color: "#17362c", fontSize: 16 }
 });
