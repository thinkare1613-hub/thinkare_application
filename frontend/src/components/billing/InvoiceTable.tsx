import { Download, Pencil, Printer, Trash2, Wallet } from "lucide-react";
import type { Invoice } from "./types";

type InvoiceTableProps = {
  invoices: Invoice[];
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCollect: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
};

function downloadInvoice(invoice: Invoice) {
  const content = [`Invoice: ${invoice.number}`, `Patient: ${invoice.patient}`, `Date: ${invoice.date}`, `Amount: ₹${invoice.amount.toLocaleString("en-IN")}`, `Status: ${invoice.status}`, `Payment method: ${invoice.method}`].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  link.download = `${invoice.number}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function InvoiceTable({ invoices, search, status, onSearchChange, onStatusChange, onCollect, onEdit, onDelete }: InvoiceTableProps) {
  const filtered = invoices.filter((invoice) => `${invoice.number} ${invoice.patient}`.toLowerCase().includes(search.toLowerCase()) && (!status || invoice.status === status));

  return (
    <section className="rounded-xl border border-[#d8e2d9] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-bold uppercase tracking-[.1em] text-[#19b3a2]">Invoices</p><h3 className="mt-1 text-xl font-bold text-[#17362c]">Recent invoices</h3></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search invoice, patient..." aria-label="Search invoice or patient" className="rounded-lg border border-[#c7d5ca] px-3 py-2 text-sm outline-none focus:border-[#19b3a2]" />
          <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter invoice status" className="rounded-lg border border-[#c7d5ca] px-3 py-2 text-sm"><option value="">All status</option><option>Paid</option><option>Partially Paid</option><option>Pending</option><option>Overdue</option><option>Refunded</option><option>Cancelled</option></select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-[#d8e2d9] text-xs uppercase tracking-[.08em] text-[#587068]"><tr>{["Invoice", "Patient", "Date", "Amount", "Status", "Actions"].map((heading) => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}</tr></thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr key={invoice.id} className="border-b border-[#edf2ef]">
                <td className="px-3 py-4 font-semibold">{invoice.number}</td><td className="px-3 py-4">{invoice.patient}</td><td className="px-3 py-4">{invoice.date}</td><td className="px-3 py-4 font-semibold">₹{invoice.amount.toLocaleString("en-IN")}</td>
                <td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${invoice.status === "Paid" ? "bg-[#eaf5ef] text-[#0d523e]" : invoice.status === "Overdue" ? "bg-[#fce9eb] text-[#8a1f2d]" : invoice.status === "Cancelled" ? "bg-[#f1f3f2] text-[#587068]" : "bg-[#fff7e9] text-[#8a5e00]"}`}>{invoice.status}</span></td>
                <td className="px-3 py-4"><div className="flex items-center gap-1">
                  <button type="button" onClick={() => onEdit(invoice)} aria-label={`Edit ${invoice.number}`} title="Edit invoice" className="rounded-lg p-2 text-[#138f82] hover:bg-[#eaf9f7]"><Pencil size={16} /></button>
                  <button type="button" onClick={() => onDelete(invoice)} aria-label={`Delete ${invoice.number}`} title="Delete invoice" className="rounded-lg p-2 text-[#a52f3d] hover:bg-[#fce9eb]"><Trash2 size={16} /></button>
                  <button type="button" onClick={() => window.print()} aria-label={`Print ${invoice.number}`} title="Print invoice" className="rounded-lg p-2 text-[#587068] hover:bg-[#f1f3f2]"><Printer size={16} /></button>
                  <button type="button" onClick={() => downloadInvoice(invoice)} aria-label={`Download ${invoice.number}`} title="Download invoice" className="rounded-lg p-2 text-[#587068] hover:bg-[#f1f3f2]"><Download size={16} /></button>
                  {invoice.status !== "Paid" && <button type="button" onClick={() => onCollect(invoice)} aria-label={`Collect payment for ${invoice.number}`} title="Collect payment" className="rounded-lg p-2 text-[#138f82] hover:bg-[#eaf9f7]"><Wallet size={16} /></button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}