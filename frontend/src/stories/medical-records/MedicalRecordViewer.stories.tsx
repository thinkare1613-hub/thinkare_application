import type { Meta, StoryObj } from "@storybook/react-vite";
import { MedicalRecordViewer } from "../../components/medical-records/MedicalRecordViewer";

const meta: Meta<typeof MedicalRecordViewer> = { title: "Medical Records/MedicalRecordViewer", component: MedicalRecordViewer };
export default meta;
type Story = StoryObj<typeof MedicalRecordViewer>;
export const Default: Story = { args: { record: { id: "cbc", category: "Lab Reports", title: "Blood Test Report", summary: "Complete Blood Count (CBC)", clinician: "Dr. Sarah Johnson", facility: "City Care Hospital", date: "June 18, 2026", attachment: "CBC_Report.pdf" }, onBack: () => undefined } };