import type { Meta, StoryObj } from "@storybook/react-vite";
import { BillingPage } from "../../components/billing/BillingPage";
const meta: Meta<typeof BillingPage> = { title: "Billing/BillingPage", component: BillingPage, parameters: { layout: "fullscreen" } };
export default meta;
export const Default: StoryObj<typeof BillingPage> = {};