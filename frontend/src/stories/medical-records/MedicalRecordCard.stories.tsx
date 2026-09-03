import type { Meta, StoryObj } from "@storybook/react-vite";
import { MedicalRecordCard } from "../../components/medical-records/MedicalRecordCard";

const meta: Meta<typeof MedicalRecordCard> = { title: "Medical Records/MedicalRecordCard", component: MedicalRecordCard };
export default meta;
type Story = StoryObj<typeof MedicalRecordCard>;

export const LabReport: Story = { args: { record: { id: "cbc", category: "Lab Reports", title: "Blood Test Report", summary: "Complete Blood Count (CBC)", clinician: "Dr. Sarah Johnson", facility: "City Care Hospital", date: "June 18, 2026", attachment: "CBC_Report.pdf" }, onView: () => undefined } };
export const VisitSummary: Story = { args: { record: { id: "visit", category: "Visit Summaries", title: "Consultation", summary: "General Consultation", clinician: "Dr. Michael Smith", facility: "ABC Dental Clinic", date: "June 15, 2026", diagnosis: "Hypertension", prescriptionCount: 2, attachment: "Consultation_Summary.pdf" }, onView: () => undefined } };