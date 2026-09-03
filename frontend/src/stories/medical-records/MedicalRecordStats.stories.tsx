import type { Meta, StoryObj } from "@storybook/react-vite";
import { MedicalRecordStats } from "../../components/medical-records/MedicalRecordStats";

const meta: Meta<typeof MedicalRecordStats> = { title: "Medical Records/MedicalRecordStats", component: MedicalRecordStats };
export default meta;
type Story = StoryObj<typeof MedicalRecordStats>;
export const Default: Story = { args: { total: 12, reports: 8, visits: 5 } };