import { Platform } from "react-native";
import type { ReadRecordsOptions, RecordResult, RecordType } from "react-native-health-connect";

export type WearableMetricInput = {
  metric_type: "steps" | "heart_rate" | "sleep_duration";
  metric_value: number;
  unit: "count" | "bpm" | "minutes";
  recorded_at: string;
};

const supportedAndroidDataOrigins = [
  "com.crrepa.band.dafit",
  "com.google.android.apps.fitness",
];
const readPermissions = [
  { accessType: "read", recordType: "Steps" },
  { accessType: "read", recordType: "HeartRate" },
  { accessType: "read", recordType: "SleepSession" },
] as const;

type DailyMetrics = { steps: number; heartTotal: number; heartSamples: number; sleepMinutes: number };

function dayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

async function readAll<T extends RecordType>(recordType: T, options: ReadRecordsOptions) {
  const records: RecordResult<T>[] = [];
  let pageToken: string | undefined;
  let pageCount = 0;

  do {
    const page = await (await import("react-native-health-connect")).readRecords(recordType, {
      ...options,
      ...(pageToken ? { pageToken } : {}),
    });
    records.push(...page.records);
    pageToken = page.pageToken;
    pageCount += 1;
  } while (pageToken && pageCount < 10);

  return records;
}

export async function readFitbitHealthConnectMetrics(): Promise<WearableMetricInput[]> {
  if (Platform.OS !== "android") {
    throw new Error("Fitbit Health Connect sync is available on Android only.");
  }

  let healthConnect: typeof import("react-native-health-connect");
  try {
    healthConnect = await import("react-native-health-connect");
  } catch {
    throw new Error("Install the Thinkare Android development build; Health Connect is not available in Expo Go.");
  }

  const sdkStatus = await healthConnect.getSdkStatus();
  if (sdkStatus === healthConnect.SdkAvailabilityStatus.SDK_UNAVAILABLE) {
    throw new Error("Install Health Connect from Google Play, then try again.");
  }
  if (sdkStatus === healthConnect.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    throw new Error("Update Health Connect from Google Play, then try again.");
  }
  if (!(await healthConnect.initialize())) {
    throw new Error("Health Connect could not be initialized on this device.");
  }

  const granted = await healthConnect.requestPermission([...readPermissions]);
  const missingPermission = readPermissions.find((requested) =>
    !granted.some((permission) => permission.accessType === "read" && permission.recordType === requested.recordType),
  );
  if (missingPermission) {
    throw new Error(`Allow Thinkare to read ${missingPermission.recordType} in Health Connect to continue.`);
  }

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
  const options: ReadRecordsOptions = {
    timeRangeFilter: { operator: "between", startTime: startTime.toISOString(), endTime: endTime.toISOString() },
    dataOriginFilter: supportedAndroidDataOrigins,
    pageSize: 1000,
  };

  const [steps, heartRates, sleepSessions] = await Promise.all([
    readAll("Steps", options),
    readAll("HeartRate", options),
    readAll("SleepSession", options),
  ]);
  const daily = new Map<string, DailyMetrics>();
  const getDay = (value: string) => {
    const key = dayKey(value);
    let metrics = daily.get(key);
    if (!metrics) {
      metrics = { steps: 0, heartTotal: 0, heartSamples: 0, sleepMinutes: 0 };
      daily.set(key, metrics);
    }
    return metrics;
  };

  for (const record of steps) {
    if (!supportedAndroidDataOrigins.includes(record.metadata?.dataOrigin ?? "")) continue;
    getDay(record.endTime).steps += record.count;
  }
  for (const record of heartRates) {
    if (!supportedAndroidDataOrigins.includes(record.metadata?.dataOrigin ?? "")) continue;
    for (const sample of record.samples) {
      const metrics = getDay(sample.time);
      metrics.heartTotal += sample.beatsPerMinute;
      metrics.heartSamples += 1;
    }
  }
  for (const record of sleepSessions) {
    if (!supportedAndroidDataOrigins.includes(record.metadata?.dataOrigin ?? "")) continue;
    const durationMinutes = (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60_000;
    if (durationMinutes > 0) getDay(record.endTime).sleepMinutes += durationMinutes;
  }

  const results: WearableMetricInput[] = [];
  for (const [day, metrics] of daily) {
    const recordedAt = `${day}T00:00:00.000Z`;
    if (metrics.steps > 0) results.push({ metric_type: "steps", metric_value: Math.round(metrics.steps), unit: "count", recorded_at: recordedAt });
    if (metrics.heartSamples > 0) results.push({ metric_type: "heart_rate", metric_value: Math.round(metrics.heartTotal / metrics.heartSamples), unit: "bpm", recorded_at: recordedAt });
    if (metrics.sleepMinutes > 0) results.push({ metric_type: "sleep_duration", metric_value: Math.round(metrics.sleepMinutes), unit: "minutes", recorded_at: recordedAt });
  }

  return results.sort((left, right) => left.recorded_at.localeCompare(right.recorded_at));
}
