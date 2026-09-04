import { request } from "./api";

export type Clinic = { id: string; name: string; city?: string; address?: string; verified?: boolean };

export async function resolveClinicQr(qrValue: string): Promise<Clinic> {
  let url: URL;
  try {
    url = new URL(qrValue);
  } catch {
    throw new Error("This is not a valid Thinkare clinic QR code.");
  }

  const clinicSlug = url.pathname.match(/^\/clinic\/([^/]+)\/?$/)?.[1];
  if (!clinicSlug) {
    throw new Error("This QR code is not a Thinkare clinic booking link.");
  }

  const clinic = await request<{ id: string; name: string; address?: string }>(`/api/public/clinics/${encodeURIComponent(clinicSlug)}`);
  return { id: clinic.id, name: clinic.name, address: clinic.address, verified: true };
}
