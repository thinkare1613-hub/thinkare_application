import { useEffect, useState } from "react";
import { Activity, HeartPulse, Moon, Watch } from "lucide-react";

type WearableStatus = {
  connected: boolean;
  consent_granted: boolean;
  provider_ready: boolean;
  latest_sync_at: string | null;
  message: string;
};

type HealthMetric = {
  id: string;
  metric_type: string;
  metric_value: string;
  unit: string;
  recorded_at: string;
};

type Props = { apiUrl: string; accessToken: string };

const consentVersion = "2026-10-15-v1";
const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });
const metricCards = [
  { label: "Steps", types: ["steps"], icon: Activity },
  { label: "Heart rate", types: ["heart_rate", "heart-rate"], icon: HeartPulse },
  { label: "Sleep", types: ["sleep_duration", "sleep-duration"], icon: Moon },
];

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as { detail?: string } & T;
  if (!response.ok) throw new Error(payload.detail || "Wearable service is unavailable.");
  return payload;
}

export function ConnectedDevicesPage({ apiUrl, accessToken }: Props) {
  const [status, setStatus] = useState<WearableStatus | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const requestOptions = { headers: authHeaders(accessToken), signal: controller.signal };
    Promise.all([
      fetch(`${apiUrl}/api/wearables/fitbit/status`, requestOptions),
      fetch(`${apiUrl}/api/wearables/health-metrics`, requestOptions),
    ])
      .then(([statusResponse, metricsResponse]) => Promise.all([
        readResponse<WearableStatus>(statusResponse),
        readResponse<HealthMetric[]>(metricsResponse),
      ]))
      .then(([nextStatus, nextMetrics]) => {
        setStatus(nextStatus);
        setMetrics(nextMetrics);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMessage(error.message);
      });
    return () => controller.abort();
  }, [apiUrl, accessToken]);

  async function updateConsent(granted: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/api/wearables/fitbit/consent`, {
        method: "POST",
        headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
        body: JSON.stringify({ granted, consent_version: consentVersion }),
      });
      await readResponse<{ consent_granted: boolean }>(response);
      setStatus((current) => current ? { ...current, consent_granted: granted } : current);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update consent.");
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/api/wearables/fitbit/connect`, { headers: authHeaders(accessToken) });
      const result = await readResponse<{ authorization_url?: string }>(response);
      if (result.authorization_url) window.location.assign(result.authorization_url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start Fitbit connection.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/api/wearables/fitbit/disconnect`, { method: "DELETE", headers: authHeaders(accessToken) });
      await readResponse<{ connected: boolean }>(response);
      setStatus((current) => current ? { ...current, connected: false, consent_granted: false } : current);
      setMessage("Fitbit disconnected. Previously saved health data was preserved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to disconnect Fitbit.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteData() {
    if (!window.confirm("Delete all Fitbit health data saved to Thinkare? This cannot be undone.")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/api/wearables/health-metrics`, { method: "DELETE", headers: authHeaders(accessToken) });
      const result = await readResponse<{ deleted_count: number }>(response);
      setMetrics([]);
      setMessage(`${result.deleted_count} health readings deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete health data.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-8 sm:py-10">
      <div className="border-b border-[#d8e2d9] pb-6">
        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Patient devices</p>
        <h2 className="mt-2 text-3xl font-bold text-[#17362c] sm:text-4xl">Connected Devices</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#587068]">Choose whether to share Fitbit activity and wellness data with your care team.</p>
      </div>

      {message && <p role="status" className="mt-5 rounded-lg border border-[#d8e2d9] bg-white px-4 py-3 text-sm text-[#587068]">{message}</p>}

      <section className="mt-6 border-y border-[#d8e2d9] py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e5f5f0] text-[#087f68]"><Watch aria-hidden="true" /></div>
            <div>
              <h3 className="text-xl font-semibold text-[#17362c]">Fitbit</h3>
              <p className="mt-1 text-sm text-[#587068]">Activity and wellness data</p>
              <p className="mt-3 text-sm font-medium text-[#17362c]">{status?.connected ? "Connected" : "Not connected"}</p>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#587068]">
                {status?.message || "Google Health API access has not been verified and live connection is unavailable."}
              </p>
              {status?.latest_sync_at && <p className="mt-2 text-xs text-[#587068]">Last sync: {new Date(status.latest_sync_at).toLocaleString()}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            {status?.connected && <button type="button" disabled={busy} onClick={() => void disconnect()} className="rounded-lg border border-[#cbd9d1] px-4 py-2.5 text-sm font-semibold text-[#17362c] disabled:opacity-50">Disconnect</button>}
            {!status?.connected && <button type="button" disabled={busy || !status?.consent_granted} onClick={() => void connect()} className="rounded-lg bg-[#087f68] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Connect Fitbit</button>}
          </div>
        </div>

        <label className="mt-6 flex max-w-3xl items-start gap-3 text-sm leading-6 text-[#42574f]">
          <input type="checkbox" className="mt-1 size-4 accent-[#087f68]" checked={status?.consent_granted ?? false} disabled={busy || !status} onChange={(event) => void updateConsent(event.currentTarget.checked)} />
          <span>I consent to Thinkare accessing and storing Fitbit health and activity data for sharing with my care team. I can withdraw consent at any time.</span>
        </label>
      </section>

      <section className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[#17362c]">Recent readings</h3>
            <p className="mt-1 text-sm text-[#587068]">Only readings saved to your patient account are shown.</p>
          </div>
          <button type="button" disabled={!metrics.length || busy} onClick={() => void deleteData()} className="text-sm font-semibold text-[#a33a48] disabled:opacity-50">Delete data</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const latest = metrics.find((metric) => card.types.includes(metric.metric_type));
            return (
              <div key={card.label} className="border border-[#d8e2d9] bg-white p-4">
                <div className="flex items-center gap-2 text-[#087f68]"><Icon className="size-4" aria-hidden="true" /><span className="text-sm font-semibold text-[#17362c]">{card.label}</span></div>
                <p className="mt-4 text-lg font-semibold text-[#17362c]">{latest ? `${latest.metric_value} ${latest.unit}` : "Awaiting connection"}</p>
                <p className="mt-1 text-xs text-[#718078]">{latest ? new Date(latest.recorded_at).toLocaleString() : "No saved readings"}</p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-7 border-l-2 border-[#d9a441] pl-3 text-sm leading-6 text-[#587068]">Wearable readings are informational and are not a diagnosis or an emergency-monitoring service.</p>
    </section>
  );
}
