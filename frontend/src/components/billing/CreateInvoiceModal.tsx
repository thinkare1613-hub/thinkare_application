import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { BillingInvoicePayload, Invoice, InvoiceStatus } from "./types";

type Service = { name: string; amount: number };

type CreateInvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: BillingInvoicePayload) => void;
  editingInvoice?: Invoice | null;
};

const defaultServices: Service[] = [
  { name: "Consultation", amount: 800 },
  { name: "Blood Test", amount: 1200 },
  { name: "Medicine", amount: 350 },
];

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function CreateInvoiceModal({ isOpen, onClose, onCreate, editingInvoice }: CreateInvoiceModalProps) {
  const [patient, setPatient] = useState("");
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(10);
  const [paymentStatus, setPaymentStatus] = useState<InvoiceStatus>("Pending");
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    if (editingInvoice) {
      setPatient(editingInvoice.patient);
      setServices(defaultServices);
      setDiscount(0);
      setTaxRate(10);
      setPaymentStatus(editingInvoice.status);
      setPaidAmount(editingInvoice.status === "Paid" ? editingInvoice.amount : 0);
      setPaymentMethod(editingInvoice.method);
    } else {
      setPatient("");
      setServices(defaultServices);
      setDiscount(0);
      setTaxRate(10);
      setPaymentStatus("Pending");
      setPaidAmount(0);
      setPaymentMethod("Cash");
    }
  }, [editingInvoice, isOpen]);

  if (!isOpen) return null;

  const subtotal = services.reduce((sum, service) => sum + service.amount, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = Math.max(0, subtotal - discount + tax);
  const remaining = Math.max(0, total - paidAmount);

  function updateService(index: number, field: keyof Service, value: string) {
    setServices((current) => current.map((service, serviceIndex) => serviceIndex === index
      ? { ...service, [field]: field === "amount" ? Math.max(0, Number(value)) : value }
      : service));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      patient: patient || "Walk-in patient",
      appointment: "No appointment linked",
      services,
      discount,
      tax,
      status: paymentStatus,
      method: paymentMethod,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#17362c]/40 p-4">
      <form role="dialog" aria-modal="true" aria-label={editingInvoice ? "Edit invoice" : "Create new invoice"} onSubmit={handleSubmit} className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="flex shrink-0 items-start justify-between border-b border-[#d8e2d9] px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#17362c]">{editingInvoice ? "Edit Invoice" : "Create New Invoice"}</h2>
            {editingInvoice && <p className="mt-1 text-sm text-[#587068]">{editingInvoice.number} · Created {editingInvoice.date}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close invoice modal" title="Close" className="rounded-lg p-1 text-[#587068] hover:bg-[#f1f3f2]"><X size={20} /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center justify-between rounded-lg bg-[#eaf5ef] px-3 py-2 text-sm"><span className="font-semibold text-[#17362c]">Invoice status</span><span className="font-bold text-[#0d523e]">{paymentStatus}</span></div>

          <label className="mt-5 block text-sm font-semibold text-[#17362c]">
            Patient
            {editingInvoice ? <div className="mt-2 flex items-center justify-between rounded-lg border border-[#d8e2d9] bg-[#f5faf7] px-3 py-2.5"><span>{patient}</span><button type="button" className="text-xs font-semibold text-[#19b3a2]">View patient</button></div> : <input required value={patient} onChange={(event) => setPatient(event.target.value)} placeholder="Search patient..." className="mt-2 w-full rounded-lg border border-[#c7d5ca] px-3 py-2.5" />}
          </label>

          <div className="mt-4 text-sm font-semibold text-[#17362c]">Appointment<div className="mt-2 rounded-lg border border-[#d8e2d9] bg-[#f5faf7] px-3 py-2.5 font-normal">No appointment linked</div></div>

          <section className="mt-5 border-y border-[#d8e2d9] py-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-[#17362c]">Services</h3><button type="button" onClick={() => setServices((current) => [...current, { name: "New service", amount: 0 }])} className="inline-flex items-center gap-1 text-sm font-semibold text-[#19b3a2]"><Plus size={16} /> Add service</button></div>
            <div className="mt-3 space-y-3">{services.map((service, index) => <div key={`${service.name}-${index}`} className="flex items-center gap-2"><input aria-label={`Service ${index + 1} name`} value={service.name} onChange={(event) => updateService(index, "name", event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#c7d5ca] px-3 py-2 text-sm" /><div className="flex items-center rounded-lg border border-[#c7d5ca] px-2"><span className="text-sm text-[#587068]">₹</span><input aria-label={`${service.name} amount`} type="number" min="0" value={service.amount} onChange={(event) => updateService(index, "amount", event.target.value)} className="w-24 px-2 py-2 text-right text-sm outline-none" /></div><button type="button" onClick={() => setServices((current) => current.filter((_, serviceIndex) => serviceIndex !== index))} aria-label={`Remove ${service.name}`} title={`Remove ${service.name}`} className="rounded-lg p-2 text-[#8a1f2d] hover:bg-[#fce9eb]"><Trash2 size={16} /></button></div>)}</div>
          </section>

          <div className="space-y-3 py-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><label className="flex items-center justify-between gap-4">Discount<input type="number" min="0" value={discount} onChange={(event) => setDiscount(Math.max(0, Number(event.target.value)))} className="w-28 rounded border px-2 py-1 text-right" /></label><label className="flex items-center justify-between gap-4">Tax ({taxRate}%)<span className="flex items-center"><input type="number" min="0" max="100" value={taxRate} onChange={(event) => setTaxRate(Math.max(0, Number(event.target.value)))} className="w-16 rounded border px-2 py-1 text-right" /><span className="ml-2 w-24 text-right">{formatCurrency(tax)}</span></span></label><div className="flex justify-between border-t border-[#d8e2d9] pt-3 text-base font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div></div>

          <section className="border-t border-[#d8e2d9] pt-4"><label className="block text-sm font-semibold text-[#17362c]">Payment status<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as InvoiceStatus)} className="mt-2 w-full rounded-lg border border-[#c7d5ca] px-3 py-2.5 font-normal"><option>Paid</option><option>Partially Paid</option><option>Pending</option><option>Overdue</option><option>Refunded</option><option>Cancelled</option></select></label><label className="mt-3 block text-sm font-semibold text-[#17362c]">Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 w-full rounded-lg border border-[#c7d5ca] px-3 py-2.5 font-normal"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank transfer</option></select></label>{paymentStatus === "Partially Paid" && <div className="mt-4 rounded-lg bg-[#fff7e9] p-3 text-sm"><div className="flex justify-between"><span>Invoice total</span><strong>{formatCurrency(total)}</strong></div><label className="mt-2 flex items-center justify-between">Paid<input type="number" min="0" max={total} value={paidAmount} onChange={(event) => setPaidAmount(Math.min(total, Math.max(0, Number(event.target.value))))} className="w-28 rounded border px-2 py-1 text-right" /></label><div className="mt-2 flex justify-between font-semibold"><span>Remaining</span><span>{formatCurrency(remaining)}</span></div></div>}</section>
        </div>

        <footer className="sticky bottom-0 flex shrink-0 justify-end gap-3 border-t border-[#d8e2d9] bg-white px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg border border-[#c7d5ca] px-4 py-2.5 text-sm font-semibold text-[#17362c]">Cancel</button><button type="submit" className="rounded-lg bg-[#19b3a2] px-4 py-2.5 text-sm font-semibold text-white">{editingInvoice ? "Save changes" : "Create invoice"}</button></footer>
      </form>
    </div>
  );
}