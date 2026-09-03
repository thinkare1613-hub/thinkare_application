import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyMedicalRecords } from "../../components/medical-records/EmptyMedicalRecords";

const meta: Meta<typeof EmptyMedicalRecords> = { title: "Medical Records/EmptyMedicalRecords", component: EmptyMedicalRecords };
export default meta;
type Story = StoryObj<typeof EmptyMedicalRecords>;
export const Default: Story = { args: { onUpload: () => undefined } };