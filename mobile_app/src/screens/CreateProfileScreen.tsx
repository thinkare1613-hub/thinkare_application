import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date: Date) {
	return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`;
}

function dateKey(date: Date) {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function CreateProfileScreen({ onComplete }: { onComplete: (profile: { name: string; email: string; password: string }) => Promise<void> }) {
	const today = new Date();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [birthDate, setBirthDate] = useState<Date | null>(null);
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear() - 25, today.getMonth(), 1));
	const calendarDays = useMemo(() => {
		const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
		const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
		return Array.from({ length: firstDay + daysInMonth }, (_, index) => {
			if (index < firstDay) return null;
			return new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), index - firstDay + 1);
		});
	}, [calendarMonth]);

	function openCalendar() {
		setCalendarMonth(birthDate ? new Date(birthDate.getFullYear(), birthDate.getMonth(), 1) : new Date(today.getFullYear() - 25, today.getMonth(), 1));
		setCalendarOpen(true);
	}

	function selectDate(date: Date) {
		if (date > today) return;
		setBirthDate(date);
		setCalendarOpen(false);
	}

	async function submit() {
		if (!name.trim() || !email.trim() || !password) { setError("Name, email, and password are required."); return; }
		setIsSaving(true); setError("");
		try { await onComplete({ name: name.trim(), email: email.trim(), password }); } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to create your account."); setIsSaving(false); }
	}

	return (
		<View style={styles.page}>
			<Text style={styles.kicker}>YOUR PROFILE</Text>
			<Text style={styles.title}>Create your profile</Text>
			<Text style={styles.copy}>Just the essentials for your first visit. You can add medical details later.</Text>
			<TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
			<Pressable accessibilityRole="button" onPress={openCalendar} style={styles.input}>
				<Text style={birthDate ? styles.inputText : styles.placeholder}>{birthDate ? formatDate(birthDate) : "Date of birth - DD / MM / YYYY"}</Text>
			</Pressable>
			<TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
			<TextInput value={password} onChangeText={setPassword} placeholder="Create password" secureTextEntry style={styles.input} />
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<View style={styles.spacer} />
			<PrimaryButton label={isSaving ? "Creating account..." : "Create account"} onPress={() => void submit()} />

			<Modal transparent visible={calendarOpen} animationType="slide" onRequestClose={() => setCalendarOpen(false)}>
				<Pressable style={styles.modalBackdrop} onPress={() => setCalendarOpen(false)}>
					<Pressable style={styles.calendar} onPress={(event) => event.stopPropagation()}>
						<View style={styles.calendarHeader}>
							<Pressable accessibilityLabel="Previous month" onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} style={styles.monthButton}>
								<Text style={styles.monthButtonText}>‹</Text>
							</Pressable>
							<Text style={styles.monthTitle}>{monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</Text>
							<Pressable accessibilityLabel="Next month" onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} style={styles.monthButton}>
								<Text style={styles.monthButtonText}>›</Text>
							</Pressable>
						</View>
						<View style={styles.weekRow}>{weekDays.map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}</View>
						<View style={styles.daysGrid}>
							{calendarDays.map((date, index) => date ? (
								<Pressable key={dateKey(date)} disabled={date > today} onPress={() => selectDate(date)} style={[styles.day, dateKey(date) === (birthDate ? dateKey(birthDate) : "") && styles.selectedDay, date > today && styles.disabledDay]}>
									<Text style={[styles.dayText, dateKey(date) === (birthDate ? dateKey(birthDate) : "") && styles.selectedDayText, date > today && styles.disabledDayText]}>{date.getDate()}</Text>
								</Pressable>
							) : <View key={`empty-${index}`} style={styles.day} />)}
						</View>
						<Pressable onPress={() => setCalendarOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	page: { flex: 1, padding: 28, paddingTop: 70, backgroundColor: "#f4faf7" },
	kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 },
	title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 14 },
	copy: { color: "#587068", fontSize: 17, lineHeight: 26, marginTop: 12, marginBottom: 26 },
	input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#c7d5ca", borderRadius: 14, padding: 16, marginBottom: 12, fontSize: 16 },
	inputText: { color: "#17362c", fontSize: 16 },
	placeholder: { color: "#71817a", fontSize: 16 },
	spacer: { flex: 1 },
	error: { color: "#9f1d2f", marginTop: 4 },
	modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,54,44,0.35)" },
	calendar: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
	calendarHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
	monthButton: { alignItems: "center", height: 42, justifyContent: "center", width: 42 },
	monthButtonText: { color: "#0d8f7c", fontSize: 32, lineHeight: 34 },
	monthTitle: { color: "#17362c", fontSize: 18, fontWeight: "800" },
	weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
	weekDay: { color: "#587068", fontSize: 12, textAlign: "center", width: 38 },
	daysGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
	day: { alignItems: "center", height: 44, justifyContent: "center", width: "14.2857%" },
	dayText: { color: "#17362c", fontSize: 15 },
	selectedDay: { backgroundColor: "#0d8f7c", borderRadius: 22 },
	selectedDayText: { color: "#fff", fontWeight: "800" },
	disabledDay: { opacity: 0.3 },
	disabledDayText: { color: "#71817a" },
	cancelButton: { alignItems: "center", borderColor: "#c7d5ca", borderRadius: 12, borderWidth: 1, marginTop: 16, padding: 14 },
	cancelText: { color: "#0d8f7c", fontSize: 16, fontWeight: "700" },
});
