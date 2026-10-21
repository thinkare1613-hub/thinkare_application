import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import {
  deleteWearableMetrics,
  disconnectFitbit,
  getFitbitStatus,
  getWearableMetrics,
  syncFitbit,
  updateFitbitConsent,
  type HealthMetric,
  type WearableStatus,
} from "../services/wearables";
import { readFitbitHealthConnectMetrics } from "../services/healthConnect";

const metricLabels: Record<string, string> = {
  steps: "Steps",
  heart_rate: "Heart rate",
  "heart-rate": "Heart rate",
  sleep_duration: "Sleep duration",
  "sleep-duration": "Sleep duration",
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to reach the wearable service.";
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function ConnectedDevicesScreen({ token, onBack }: { token: string | null; onBack: () => void }) {
  const [status, setStatus] = useState<WearableStatus | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) {
      setError("Your patient session has expired. Sign in again to view connected devices.");
      setLoading(false);
      return;
    }
    setError("");
    try {
      const [nextStatus, nextMetrics] = await Promise.all([
        getFitbitStatus(token),
        getWearableMetrics(token),
      ]);
      setStatus(nextStatus);
      setMetrics(nextMetrics);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function withBusy(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (actionError) {
      setMessage(errorMessage(actionError));
    } finally {
      setBusy(false);
    }
  }

  function toggleConsent(granted: boolean) {
    if (!token) return;
    void withBusy(async () => {
      await updateFitbitConsent(token, granted);
      setStatus((current) => current ? { ...current, consent_granted: granted } : current);
      setMessage(granted ? "Consent saved. Connect Fitbit data through Health Connect on Android." : "Consent withdrawn.");
        setMessage(granted ? "Consent saved. Sync Fire-Boltt data through Health Connect on Android." : "Consent withdrawn.");
    });
  }

  async function syncFromDevice() {
    if (!token) return;
    const localMetrics = await readFitbitHealthConnectMetrics();
    const result = await syncFitbit(token, localMetrics);
    await loadData();
    if (result.received_count === 0) {
      setMessage("No Da Fit or Google Fit records were found in Health Connect. Da Fit's Android export is not confirmed for this model.");
    } else {
      setMessage(`Synced ${result.synced_count} Fire-Boltt readings from Health Connect.`);
    }
  }

  function startConnection() {
    void withBusy(syncFromDevice);
  }

  function syncData() {
    if (!token) return;
    void withBusy(syncFromDevice);
  }

  function disconnect() {
    if (!token) return;
    Alert.alert("Disconnect Fire-Boltt?", "New data will stop syncing. Previously saved readings will remain until you delete them.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: () => void withBusy(async () => {
          await disconnectFitbit(token);
          await loadData();
          setMessage("Fire-Boltt disconnected. Saved readings were preserved.");
        }),
      },
    ]);
  }

  function deleteData() {
    if (!token) return;
    Alert.alert("Delete Fire-Boltt data?", "This permanently deletes all Fire-Boltt readings saved to Thinkare.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete data",
        style: "destructive",
        onPress: () => void withBusy(async () => {
          const result = await deleteWearableMetrics(token);
          setMetrics([]);
          setMessage(`${result.deleted_count} Fire-Boltt readings deleted.`);
          await loadData();
        }),
      },
    ]);
  }

  const readings = metrics.reduce<HealthMetric[]>((latest, metric) => {
    if (metricLabels[metric.metric_type] && !latest.some((entry) => entry.metric_type === metric.metric_type)) latest.push(metric);
    return latest;
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </Pressable>
      <Text style={styles.kicker}>PATIENT DEVICES</Text>
      <Text style={styles.title}>Connected Devices</Text>
      <Text style={styles.intro}>Choose whether to share your Fire-Boltt activity and wellness data with your care team.</Text>

      {error ? (
        <View accessibilityRole="alert" style={styles.errorBox}>
          <Text style={styles.errorTitle}>Can’t reach Thinkare</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Check that the API is running and that your phone can reach the address configured in EXPO_PUBLIC_API_URL.</Text>
          <Pressable accessibilityRole="button" onPress={() => { setLoading(true); void loadData(); }} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? <ActivityIndicator color="#087f68" style={styles.loader} /> : null}

      {!loading && status ? (
        <>
          <View style={styles.deviceSection}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceIcon}><Text style={styles.deviceIconText}>FB</Text></View>
              <View style={styles.deviceCopy}>
                <Text style={styles.deviceName}>Fire-Boltt BSW049</Text>
                <Text style={styles.muted}>Da Fit activity and wellness data</Text>
                <Text style={styles.connectionState}>{status.connected ? "Connected via Health Connect" : "Not connected"}</Text>
              </View>
            </View>

            <View style={styles.providerNotice}>
              <Text style={styles.providerNoticeText}>{Platform.OS === "android" ? status.message : "Fire-Boltt data import through Health Connect is available on Android only."}</Text>
            </View>
            {status.latest_sync_at ? <Text style={styles.syncTime}>Last sync: {formatTime(status.latest_sync_at)}</Text> : null}

            <View style={styles.consentRow}>
              <Text style={styles.consentText}>I consent to Thinkare accessing and storing my Fire-Boltt health and activity data for sharing with my care team. I can withdraw consent at any time.</Text>
              <Switch
                accessibilityLabel="Consent to share Fire-Boltt health data"
                value={status.consent_granted}
                disabled={busy}
                onValueChange={toggleConsent}
                trackColor={{ false: "#cbd9d1", true: "#91d6c4" }}
                thumbColor={status.consent_granted ? "#087f68" : "#f4f4f4"}
              />
            </View>

            <View style={styles.actionRow}>
              {status.connected ? (
                <>
                  <Pressable accessibilityRole="button" disabled={busy} onPress={syncData} style={[styles.primaryButton, busy && styles.disabledButton]}>
                    <Text style={styles.primaryButtonText}>{busy ? "Working…" : "Sync now"}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" disabled={busy} onPress={disconnect} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Disconnect</Text>
                  </Pressable>
                </>
              ) : (
                  <Pressable accessibilityRole="button" disabled={busy || !status.consent_granted || !status.health_connect_available || Platform.OS !== "android"} onPress={startConnection} style={[styles.primaryButton, (busy || !status.consent_granted || !status.health_connect_available || Platform.OS !== "android") && styles.disabledButton]}>
                    <Text style={styles.primaryButtonText}>{busy ? "Connecting…" : "Connect Fitbit data"}</Text>
                </Pressable>
              )}
            </View>
          </View>

          {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}

          <View style={styles.readingsSection}>
            <View style={styles.readingsHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent readings</Text>
                <Text style={styles.muted}>Saved readings from your patient account</Text>
              </View>
              <Pressable accessibilityRole="button" disabled={busy || metrics.length === 0} onPress={deleteData}>
                <Text style={[styles.deleteText, (busy || metrics.length === 0) && styles.disabledText]}>Delete data</Text>
              </Pressable>
            </View>

            {readings.length ? readings.map((metric) => (
              <View key={metric.id} style={styles.metricRow}>
                <View>
                  <Text style={styles.metricName}>{metricLabels[metric.metric_type]}</Text>
                  <Text style={styles.metricDate}>{formatTime(metric.recorded_at)}</Text>
                </View>
                <Text style={styles.metricValue}>{metric.metric_value} {metric.unit}</Text>
              </View>
            )) : <Text style={styles.emptyReadings}>No saved readings yet.</Text>}
          </View>

          <Text style={styles.disclaimer}>Wearable readings are informational and are not a diagnosis or an emergency-monitoring service.</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4faf7" },
  content: { padding: 24, paddingTop: 56, paddingBottom: 44 },
  backButton: { alignSelf: "flex-start", paddingVertical: 6, paddingRight: 12, marginBottom: 22 },
  backText: { color: "#087f68", fontSize: 16, fontWeight: "700" },
  kicker: { color: "#0d8f7c", fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#17362c", fontSize: 32, fontWeight: "800", marginTop: 10 },
  intro: { color: "#587068", fontSize: 15, lineHeight: 23, marginTop: 8, marginBottom: 24 },
  loader: { marginTop: 36 },
  errorBox: { backgroundColor: "#fff", borderColor: "#e3c5be", borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 20 },
  errorTitle: { color: "#8e3325", fontSize: 16, fontWeight: "800" },
  errorText: { color: "#65433e", marginTop: 8, lineHeight: 21 },
  errorHint: { color: "#6b7771", marginTop: 8, fontSize: 13, lineHeight: 19 },
  deviceSection: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#d7e6df", paddingVertical: 20 },
  deviceHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  deviceIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#e5f5f0", alignItems: "center", justifyContent: "center" },
  deviceIconText: { color: "#087f68", fontSize: 23, fontWeight: "900" },
  deviceCopy: { flex: 1 },
  deviceName: { color: "#17362c", fontSize: 21, fontWeight: "800" },
  muted: { color: "#587068", fontSize: 13, marginTop: 4, lineHeight: 19 },
  connectionState: { color: "#17362c", fontSize: 14, fontWeight: "700", marginTop: 10 },
  providerNotice: { backgroundColor: "#fff", borderLeftWidth: 3, borderLeftColor: "#d9a441", padding: 12, marginTop: 16 },
  providerNoticeText: { color: "#5b6159", fontSize: 13, lineHeight: 19 },
  syncTime: { color: "#6b7771", fontSize: 12, marginTop: 10 },
  consentRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 },
  consentText: { flex: 1, color: "#42574f", fontSize: 13, lineHeight: 20 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  primaryButton: { minHeight: 46, justifyContent: "center", alignItems: "center", borderRadius: 10, backgroundColor: "#087f68", paddingHorizontal: 18, paddingVertical: 12 },
  primaryButtonText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  disabledButton: { opacity: 0.45 },
  secondaryButton: { alignSelf: "flex-start", marginTop: 12, borderWidth: 1, borderColor: "#b8cfc4", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  secondaryButtonText: { color: "#17362c", fontSize: 13, fontWeight: "700" },
  message: { color: "#42574f", fontSize: 13, lineHeight: 20, marginTop: 14 },
  readingsSection: { paddingTop: 24 },
  readingsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  sectionTitle: { color: "#17362c", fontSize: 20, fontWeight: "800" },
  deleteText: { color: "#a33a48", fontSize: 13, fontWeight: "700" },
  disabledText: { opacity: 0.4 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, backgroundColor: "#fff", borderColor: "#d7e6df", borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 10 },
  metricName: { color: "#17362c", fontWeight: "700", fontSize: 14 },
  metricDate: { color: "#718078", fontSize: 11, marginTop: 5 },
  metricValue: { color: "#087f68", fontSize: 16, fontWeight: "800", textAlign: "right" },
  emptyReadings: { color: "#718078", fontSize: 14, paddingVertical: 20 },
  disclaimer: { color: "#587068", fontSize: 12, lineHeight: 18, marginTop: 24, borderLeftWidth: 2, borderLeftColor: "#d9a441", paddingLeft: 10 },
});
