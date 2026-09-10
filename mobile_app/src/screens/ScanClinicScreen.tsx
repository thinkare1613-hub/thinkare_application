import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { resolveClinicQr, type Clinic } from "../services/clinic";

export function ScanClinicScreen({ onClinicFound }: { onClinicFound: (clinic: Clinic) => void }) {
	const [permission, requestPermission] = useCameraPermissions();
	const [isResolving, setIsResolving] = useState(false);
	const [error, setError] = useState("");

	async function handleScan({ data }: { data: string }) {
		if (isResolving) return;
		setIsResolving(true);
		setError("");
		try {
			onClinicFound(await resolveClinicQr(data));
		} catch (scanError) {
			setError(scanError instanceof Error ? scanError.message : "Unable to verify this clinic QR code.");
			setIsResolving(false);
		}
	}

	return <View style={styles.page}>
		<Text style={styles.kicker}>STEP 1 OF 4</Text><Text style={styles.title}>Scan your clinic QR</Text><Text style={styles.copy}>Point your camera at the Thinkare QR code displayed by your clinic.</Text>
		<View style={styles.scanner}>
			{!permission ? <ActivityIndicator color="#0d8f7c" /> : !permission.granted ? <View style={styles.center}><Text style={styles.scanText}>Camera access is required</Text><Text style={styles.hint}>Allow camera access to scan your clinic QR code.</Text><PrimaryButton label="Allow camera" onPress={() => void requestPermission()} /></View> : <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={isResolving ? undefined : handleScan} />}
			{isResolving && <View style={styles.overlay}><ActivityIndicator color="#ffffff" /><Text style={styles.overlayText}>Checking clinic...</Text></View>}
		</View>
		{error ? <Text style={styles.error}>{error}</Text> : <Text style={styles.hint}>Hold the QR code inside the camera frame.</Text>}
		{error ? <Pressable onPress={() => { setError(""); setIsResolving(false); }}><Text style={styles.retry}>Try another QR code</Text></Pressable> : null}
	</View>;
}

const styles = StyleSheet.create({ page: { flex: 1, padding: 28, paddingTop: 70, backgroundColor: "#f4faf7" }, kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 }, title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 14 }, copy: { color: "#587068", fontSize: 17, lineHeight: 26, marginTop: 12 }, scanner: { flex: 1, minHeight: 300, marginVertical: 28, overflow: "hidden", borderRadius: 24, backgroundColor: "#17362c" }, camera: { flex: 1 }, center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }, scanText: { color: "#17362c", fontSize: 18, fontWeight: "700", marginTop: 12, textAlign: "center" }, hint: { color: "#587068", textAlign: "center", marginTop: 12, paddingHorizontal: 24 }, error: { color: "#9f1d2f", textAlign: "center", marginTop: -12, marginBottom: 12, fontWeight: "600" }, retry: { color: "#0d8f7c", textAlign: "center", fontWeight: "700", marginBottom: 12 }, overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(23,54,44,0.82)", justifyContent: "center", alignItems: "center", gap: 12 }, overlayText: { color: "#fff", fontWeight: "700" } });
