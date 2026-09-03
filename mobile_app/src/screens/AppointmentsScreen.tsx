import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppointmentCard } from "../components/AppointmentCard";
 export function AppointmentsScreen({ onBack }: { onBack: () => void }) {
	 const [doctor, setDoctor] = useState("Dr. Ananya Rao");
	 const [service, setService] = useState("General Consultation");
	 const [date, setDate] = useState("03 Sep 2026");
	 const [time, setTime] = useState("12:00 PM");
	 const [created, setCreated] = useState(false);

	 function createAppointment() {
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
						 <TextInput value={date} onChangeText={setDate} style={styles.input} />
						 <Text style={styles.label}>Time</Text>
						 <TextInput value={time} onChangeText={setTime} style={styles.input} />
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
	 button: { alignItems: "center", backgroundColor: "#0d8f7c", borderRadius: 14, marginTop: 28, padding: 17 },
	 buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
	 success: { backgroundColor: "#eaf5ef", borderRadius: 18, marginVertical: 28, padding: 18 },
	 successTitle: { color: "#0d8f7c", fontSize: 18, fontWeight: "800" },
	 successText: { color: "#17362c", fontSize: 16, lineHeight: 25, marginTop: 10 }
 });
