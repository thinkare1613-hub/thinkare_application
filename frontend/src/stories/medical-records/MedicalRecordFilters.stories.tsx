import type { Meta, StoryObj } from "@storybook/react-vite";
import { MedicalRecordFilters } from "../../components/medical-records/MedicalRecordFilters";

const meta: Meta<typeof MedicalRecordFilters> = { title: "Medical Records/MedicalRecordFilters", component: MedicalRecordFilters };
export default meta;
type Story = StoryObj<typeof MedicalRecordFilters>;
export const Default: Story = { args: { search: "", category: "All Records", onSearchChange: () => undefined, onCategoryChange: () => undefined } };