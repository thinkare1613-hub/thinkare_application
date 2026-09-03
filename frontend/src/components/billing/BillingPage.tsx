import { useState } from "react";
import { BillingMetrics } from "./BillingMetrics";
import { BillingSummaryCards } from "./BillingSummaryCards";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoiceTable } from "./InvoiceTable";
import { PaymentActivity } from "./PaymentActivity";
import { RevenueOverview } from "./RevenueOverview";
import type { BillingInvoicePayload, Invoice } from "./types";

const initialInvoices: Invoice[] = [
  { id: "1", number: "INV-1024", patient: "Rahul Sharma", date: "Sep 02", amount: 1850, status: "Paid", method: "UPI" },
  { id: "2", number: "INV-1023", patient: "Priya Singh", date: "Sep 02", amount: 3200, status: "Pending", method: "Cash" },
  { id: "3", number: "INV-1022", patient: "Amit Kumar", date: "Sep 01", amount: 950, status: "Paid", method: "Card" },
  { id: "4", number: "INV-1021", patient: "Neha Patel", date: "Aug 31", amount: 4500, status: "Overdue", method: "Cash" },
];

export function BillingPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveInvoice = (payload: BillingInvoicePayload) => {
    const subtotal = payload.services.reduce((sum, service) => sum + service.amount, 0);
    setInvoices((current) => editingInvoice
      ? current.map((invoice) => invoice.id === editingInvoice.id ? { ...invoice, patient: payload.patient, amount: subtotal - payload.discount + payload.tax, status: payload.status, method: payload.method } : invoice)
      : [{ id: `invoice-${Date.now()}`, number: `INV-${1025 + current.length}`, patient: payload.patient, date: "Sep 02", amount: subtotal - payload.discount + payload.tax, status: payload.status, method: payload.method }, ...current]);
    setEditingInvoice(null);
    setIsModalOpen(false);
  };

  const deleteInvoice = (invoice: Invoice) => {
    if (window.confirm(`Delete ${invoice.number}?`)) setInvoices((current) => current.filter((item) => item.id !== invoice.id));
  };
  const collectInvoice = (invoice: Invoice) => setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: "Paid" } : item));

  return <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Financial overview</p><h2 className="mt-2 text-3xl font-bold text-[#17362c] sm:text-4xl">Billing</h2><p className="mt-2 text-sm text-[#587068]">Review payments, outstanding balances, and invoices.</p></div><button type="button" onClick={() => { setEditingInvoice(null); setIsModalOpen(true); }} className="rounded-lg bg-[#19b3a2] px-4 py-3 text-sm font-semibold text-white">+ Create Invoice</button></div>
    <div className="mt-7"><BillingSummaryCards /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"><RevenueOverview /><PaymentActivity /></div><div className="mt-6"><InvoiceTable invoices={invoices} search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} onCollect={collectInvoice} onEdit={(invoice) => { setEditingInvoice(invoice); setIsModalOpen(true); }} onDelete={deleteInvoice} /></div><div className="mt-6"><BillingMetrics /></div><CreateInvoiceModal isOpen={isModalOpen} editingInvoice={editingInvoice} onClose={() => { setEditingInvoice(null); setIsModalOpen(false); }} onCreate={saveInvoice} />
  </section>;
}
