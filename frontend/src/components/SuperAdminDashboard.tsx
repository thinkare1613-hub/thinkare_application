import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Search, XCircle } from "lucide-react";

type Dashboard = { total_clinics: number; active_clinics: number; pending_clinics: number; total_patients: number; revenue: number; new_registrations: number };
type Clinic = { id: string; name: string; registration_number: string | null; status: string; registered_at: string; patients: number; plan: string; amount: number; payment_status: string };
type ClinicDetail = Clinic & { registration_authority: string | null; email: string | null; phone: string | null; admin: string | null; new_patients_this_month: number; active_patients: number; inactive_patients: number; doctors: number; appointments: number; medical_records: number; subscription: { plan: string; amount: number; payment_status: string; started_on: string | null; renews_on: string | null } };
type Payment = { id: string; clinic: string; invoice_number: string; plan: string; amount: number; status: string; provider: string | null; transaction_reference: string | null; paid_at: string | null };

type Props = { apiUrl: string; accessToken: string; view: "dashboard" | "payments" };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function SuperAdminDashboard({ apiUrl, accessToken, view }: Props) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicDetail | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const headers = { Authorization: `Bearer ${accessToken}` };

  useEffect(() => {
    const load = async () => {
      try {
        const endpoints = view === "payments" ? ["/api/admin/payments"] : ["/api/admin/dashboard", "/api/admin/clinics"];
        const responses = await Promise.all(endpoints.map((path) => fetch(`${apiUrl}${path}`, { headers })));
        if (responses.some((response) => !response.ok)) throw new Error("Platform data is not available. Apply migration 006_platform_monitoring.sql and sign in as a Super Admin.");
        const data = await Promise.all(responses.map((response) => response.json()));
        if (view === "payments") setPayments(data[0]); else { setDashboard(data[0]); setClinics(data[1]); }
        setError("");
      } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load platform data."); }
    };
    void load();
  }, [apiUrl, accessToken, view]);

  async function openClinic(clinicId: string) {
    const response = await fetch(`${apiUrl}/api/admin/clinics/${clinicId}`, { headers });
    if (!response.ok) { setError("Unable to load clinic details."); return; }
    setSelectedClinic(await response.json());
  }

  async function setClinicStatus(status: "APPROVED" | "REJECTED" | "SUSPENDED") {
    if (!selectedClinic) return;
    const response = await fetch(`${apiUrl}/api/admin/clinics/${selectedClinic.id}/status`, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) { setError("Unable to update clinic status."); return; }
    setSelectedClinic({ ...selectedClinic, status });
    setClinics((current) => current.map((clinic) => clinic.id === selectedClinic.id ? { ...clinic, status } : clinic));
  }

  if (selectedClinic) return <ClinicDetails clinic={selectedClinic} onBack={() => setSelectedClinic(null)} onStatusChange={setClinicStatus} />;
  if (view === "payments") return <Payments payments={payments} />;
  const shownClinics = clinics.filter((clinic) => clinic.name.toLowerCase().includes(query.toLowerCase()) || (clinic.registration_number ?? "").toLowerCase().includes(query.toLowerCase()));
  const cards = dashboard ? [["Total clinics", dashboard.total_clinics], ["Active clinics", dashboard.active_clinics], ["Pending clinics", dashboard.pending_clinics], ["Total patients", dashboard.total_patients], ["Revenue", money.format(dashboard.revenue)], ["New registrations", dashboard.new_registrations]] : [];
  return <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
    <div className="flex flex-col gap-4 border-b border-[#d8e2d9] pb-6"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#19b3a2]">Thinkare Super Admin</p><h2 className="mt-2 text-4xl font-bold text-[#17362c]">Platform monitoring</h2></div></div>
    {error && <p className="mt-6 rounded-lg border border-[#f3b3b3] bg-[#fbe9ea] px-4 py-3 text-sm text-[#7a2222]">{error}</p>}
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value]) => <div key={String(label)} className="rounded-lg border border-[#d8e2d9] bg-white p-5"><p className="text-sm text-[#587068]">{label}</p><p className="mt-3 text-3xl font-bold text-[#17362c]">{String(value)}</p></div>)}</div>
    <section className="mt-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Clinic registrations</p><h3 className="mt-1 text-2xl font-bold text-[#17362c]">Every clinic on Thinkare</h3></div><label className="flex items-center gap-2 rounded-lg border border-[#c7d5ca] bg-white px-3 py-2"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clinic..." className="w-full outline-none" /></label></div>
      <div className="mt-5 overflow-x-auto rounded-lg border border-[#d8e2d9] bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f5faf7] text-[#587068]"><tr><th className="px-4 py-3">Clinic</th><th>Registration</th><th>Patients</th><th>Plan</th><th>Payment</th><th>Status</th><th /></tr></thead><tbody>{shownClinics.map((clinic) => <tr key={clinic.id} className="border-t border-[#e4ebe5]"><td className="px-4 py-4 font-semibold text-[#17362c]">{clinic.name}</td><td>{clinic.registration_number ?? "Not provided"}</td><td>{clinic.patients}</td><td>{clinic.plan}</td><td>{money.format(clinic.amount)} · {clinic.payment_status}</td><td><span className="rounded-full bg-[#eaf5ef] px-2 py-1 text-xs font-semibold text-[#0d523e]">{clinic.status}</span></td><td><button type="button" onClick={() => void openClinic(clinic.id)} className="font-semibold text-[#19b3a2]">View clinic</button></td></tr>)}</tbody></table></div>
    </section>
  </section>;
}

function ClinicDetails({ clinic, onBack, onStatusChange }: { clinic: ClinicDetail; onBack: () => void; onStatusChange: (status: "APPROVED" | "REJECTED" | "SUSPENDED") => void }) {
  const metrics = [["Total patients", clinic.patients], ["New this month", clinic.new_patients_this_month], ["Active patients", clinic.active_patients], ["Inactive patients", clinic.inactive_patients], ["Doctors", clinic.doctors], ["Appointments", clinic.appointments], ["Medical records", clinic.medical_records]];
  return <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10"><button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-[#19b3a2]"><ArrowLeft size={16} /> Back to clinics</button><div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Clinic profile</p><h2 className="mt-2 text-4xl font-bold text-[#17362c]">{clinic.name}</h2></div><span className="rounded-full bg-[#eaf5ef] px-3 py-1 text-sm font-semibold text-[#0d523e]">{clinic.status}</span></div><div className="mt-7 grid gap-4 lg:grid-cols-2"><section className="rounded-lg border border-[#d8e2d9] bg-white p-5"><h3 className="text-xl font-bold text-[#17362c]">Clinic information</h3><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><Info label="Registration" value={clinic.registration_number} /><Info label="Authority" value={clinic.registration_authority} /><Info label="Owner / Admin" value={clinic.admin} /><Info label="Email" value={clinic.email} /><Info label="Phone" value={clinic.phone} /></dl></section><section className="rounded-lg border border-[#d8e2d9] bg-white p-5"><h3 className="text-xl font-bold text-[#17362c]">Subscription & payment</h3><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><Info label="Plan" value={clinic.subscription.plan} /><Info label="Amount" value={money.format(clinic.subscription.amount)} /><Info label="Payment" value={clinic.subscription.payment_status} /><Info label="Started" value={clinic.subscription.started_on} /><Info label="Renewal" value={clinic.subscription.renews_on} /></dl></section></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={String(label)} className="rounded-lg border border-[#d8e2d9] bg-white p-5"><p className="text-sm text-[#587068]">{label}</p><p className="mt-2 text-3xl font-bold text-[#17362c]">{value}</p></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => onStatusChange("APPROVED")} className="flex items-center gap-2 rounded-lg bg-[#19b3a2] px-4 py-2 text-sm font-semibold text-white"><CheckCircle2 size={16} /> Verify / activate</button><button type="button" onClick={() => onStatusChange("SUSPENDED")} className="flex items-center gap-2 rounded-lg border border-[#e7b7bc] bg-white px-4 py-2 text-sm font-semibold text-[#8a1f2d]"><XCircle size={16} /> Suspend</button></div></section>;
}

function Info({ label, value }: { label: string; value: string | null }) { return <div><dt className="text-xs font-bold uppercase tracking-[.1em] text-[#587068]">{label}</dt><dd className="mt-1 font-semibold text-[#17362c]">{value || "Not provided"}</dd></div>; }
function Payments({ payments }: { payments: Payment[] }) { return <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10"><p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Thinkare Super Admin</p><h2 className="mt-2 text-4xl font-bold text-[#17362c]">Subscription payments</h2><div className="mt-7 overflow-x-auto rounded-lg border border-[#d8e2d9] bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f5faf7] text-[#587068]"><tr><th className="px-4 py-3">Clinic</th><th>Invoice</th><th>Plan</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-t border-[#e4ebe5]"><td className="px-4 py-4 font-semibold text-[#17362c]">{payment.clinic}</td><td>{payment.invoice_number}</td><td>{payment.plan}</td><td>{money.format(payment.amount)}</td><td>{payment.status}</td><td>{payment.transaction_reference ?? "-"}</td></tr>)}</tbody></table></div></section>; }