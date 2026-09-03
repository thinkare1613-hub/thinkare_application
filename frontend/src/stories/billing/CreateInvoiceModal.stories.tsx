import type { Meta, StoryObj } from "@storybook/react-vite";
import { CreateInvoiceModal } from "../../components/billing/CreateInvoiceModal";
const meta: Meta<typeof CreateInvoiceModal> = { title: "Billing/CreateInvoiceModal", component: CreateInvoiceModal };
export default meta;
export const Open: StoryObj<typeof CreateInvoiceModal> = { args: { isOpen: true, onClose: () => undefined, onCreate: () => undefined } };