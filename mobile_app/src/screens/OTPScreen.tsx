import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";

export function OTPScreen({ phone, sentOtp, onVerify, onBack }: { phone: string; sentOtp: string; onVerify: (otp: string) => Promise<void>; onBack: () => void }) {
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	function verifyOtp() {
		if (otp.length !== 6) {
			setError("Enter the 6-digit OTP to continue.");
			return;
		}

		setIsSubmitting(true);
		setError("");
		void onVerify(otp)
			.catch((submitError) => {
				setError(submitError instanceof Error ? submitError.message : "Unable to verify your number.");
			})
			.finally(() => setIsSubmitting(false));
	}

	return <View style={styles.page}><Text style={styles.kicker}>SECURE SIGN IN</Text><Text style={styles.title}>Verify your number</Text><Text style={styles.copy}>OTP sent to {phone || "+91 98765 43210"}</Text><View style={styles.aiCard}><Text style={styles.aiLabel}>AI security note</Text><Text style={styles.aiText}>Verification keeps the patient journey tied to your number and clinic. The next step opens the home screen directly after a successful check.</Text><Text style={styles.aiOtp}>Development OTP: {sentOtp || "pending"}</Text></View><TextInput value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" maxLength={6} placeholder="123456" style={styles.input} /><Text style={styles.resend}>Resend OTP</Text><View style={styles.spacer} />{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton label={isSubmitting ? "Verifying..." : "Verify and continue"} onPress={verifyOtp} /><Text onPress={onBack} style={styles.back}>Change number</Text></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, padding: 28, paddingTop: 70, backgroundColor: "#f4faf7" }, kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 }, title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 14 }, copy: { color: "#587068", fontSize: 17, marginTop: 12 }, aiCard: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#d7e6df", padding: 16, marginTop: 18 }, aiLabel: { color: "#0d8f7c", fontSize: 12, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" }, aiText: { color: "#587068", marginTop: 8, lineHeight: 22, fontSize: 14 }, aiOtp: { color: "#17362c", marginTop: 12, fontSize: 15, fontWeight: "800" }, input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#c7d5ca", borderRadius: 14, padding: 18, marginTop: 34, fontSize: 22, letterSpacing: 8, textAlign: "center" }, resend: { color: "#0d8f7c", fontWeight: "700", textAlign: "center", marginTop: 18 }, spacer: { flex: 1 }, error: { color: "#9f1d2f", marginBottom: 12, fontWeight: "600" }, back: { color: "#0d8f7c", textAlign: "center", fontWeight: "700", marginTop: 20 } });
