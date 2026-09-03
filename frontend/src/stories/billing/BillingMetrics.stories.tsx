import type { Meta, StoryObj } from "@storybook/react-vite";
import { BillingMetrics } from "../../components/billing/BillingMetrics";
const meta: Meta<typeof BillingMetrics> = { title: "Billing/BillingMetrics", component: BillingMetrics };
export default meta;
export const Default: StoryObj<typeof BillingMetrics> = {};