import type { Meta, StoryObj } from "@storybook/react-vite";
import { RevenueOverview } from "../../components/billing/RevenueOverview";
const meta: Meta<typeof RevenueOverview> = { title: "Billing/RevenueOverview", component: RevenueOverview };
export default meta;
export const Default: StoryObj<typeof RevenueOverview> = {};