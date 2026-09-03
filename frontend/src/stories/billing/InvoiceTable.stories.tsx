import type { Meta, StoryObj } from "@storybook/react-vite";
import { InvoiceTable } from "../../components/billing/InvoiceTable";
const meta: Meta<typeof InvoiceTable> = { title: "Billing/InvoiceTable", component: InvoiceTable };
export default meta;
export const Default: StoryObj<typeof InvoiceTable> = { args: { invoices: [{ id: "1", number: "INV-1024", patient: "Rahul Sharma", date: "Sep 02", amount: 1850, status: "Paid", method: "UPI" }, { id: "2", number: "INV-1023", patient: "Priya Singh", date: "Sep 02", amount: 3200, status: "Pending", method: "Cash" }], search: "", status: "", onSearchChange: () => undefined, onStatusChange: () => undefined, onCollect: () => undefined } };