import type { Meta, StoryObj } from "@storybook/react-vite";
import { MedicalRecordsPage } from "../../components/medical-records/MedicalRecordsPage";

const meta: Meta<typeof MedicalRecordsPage> = { title: "Medical Records/MedicalRecordsPage", component: MedicalRecordsPage, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof MedicalRecordsPage>;
export const Default: Story = {};