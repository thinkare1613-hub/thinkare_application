import type { Meta, StoryObj } from "@storybook/react-vite";
import { BillingSummaryCards } from "../../components/billing/BillingSummaryCards";
const meta: Meta<typeof BillingSummaryCards> = { title: "Billing/BillingSummaryCards", component: BillingSummaryCards };
export default meta;
export const Default: StoryObj<typeof BillingSummaryCards> = {};