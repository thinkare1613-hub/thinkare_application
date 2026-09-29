import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
export function PhoneLoginScreen({ phone, patientName, onPhoneChange, onPatientNameChange, onContinue }: { phone: string; patientName: string; onPhoneChange: (value: string) => void; onPatientNameChange: (value: string) => void; onContinue: () => Promise<void> }) {
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	function sendOtp() {
		setIsSubmitting(true);
		setError("");
		void onContinue()
			.catch((submitError) => {
				setError(submitError instanceof Error ? submitError.message : "Unable to send OTP.");
			})
			.finally(() => setIsSubmitting(false));
	}

	return <View style={styles.page}><Text style={styles.kicker}>SECURE SIGN IN</Text><Text style={styles.title}>Verify your phone</Text><Text style={styles.copy}>We will send a one-time code to connect you securely with your clinic.</Text><Text style={styles.label}>Full name</Text><TextInput value={patientName} onChangeText={onPatientNameChange} keyboardType="default" placeholder="Patient name" style={styles.input} /><Text style={styles.label}>Mobile number</Text><TextInput value={phone} onChangeText={onPhoneChange} keyboardType="phone-pad" placeholder="+91 98765 43210" style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<View style={styles.spacer} /><PrimaryButton label={isSubmitting ? "Sending..." : "Send OTP"} onPress={sendOtp} /></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, padding: 28, paddingTop: 70, backgroundColor: "#f4faf7" }, kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 }, title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 14 }, copy: { color: "#587068", fontSize: 17, lineHeight: 26, marginTop: 12 }, label: { color: "#17362c", fontWeight: "700", marginTop: 28, marginBottom: 8 }, input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#c7d5ca", borderRadius: 14, padding: 16, fontSize: 17, color: "#17362c" }, spacer: { flex: 1 }, error: { color: "#9f1d2f", marginTop: 8, fontWeight: "600" } });
