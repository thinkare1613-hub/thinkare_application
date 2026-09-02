import type { Meta, StoryObj } from "@storybook/react-vite";
import { MedicalRecordTimeline } from "../../components/medical-records/MedicalRecordTimeline";

const meta: Meta<typeof MedicalRecordTimeline> = { title: "Medical Records/MedicalRecordTimeline", component: MedicalRecordTimeline };
export default meta;
type Story = StoryObj<typeof MedicalRecordTimeline>;
export const Default: Story = { args: { records: [{ id: "cbc", category: "Lab Reports", title: "Blood Test Report", summary: "CBC Report", clinician: "Dr. Sarah Johnson", facility: "City Care Hospital", date: "June 18, 2026", attachment: "CBC_Report.pdf" }, { id: "visit", category: "Visit Summaries", title: "Doctor Visit", summary: "General Consultation", clinician: "Dr. Michael Smith", facility: "ABC Dental Clinic", date: "June 15, 2026", attachment: "Visit_Summary.pdf" }] } };