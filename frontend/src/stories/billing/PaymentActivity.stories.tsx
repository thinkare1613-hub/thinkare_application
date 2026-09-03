import type { Meta, StoryObj } from "@storybook/react-vite";
import { PaymentActivity } from "../../components/billing/PaymentActivity";
const meta: Meta<typeof PaymentActivity> = { title: "Billing/PaymentActivity", component: PaymentActivity };
export default meta;
export const Default: StoryObj<typeof PaymentActivity> = {};