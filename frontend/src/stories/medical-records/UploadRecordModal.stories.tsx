import type { Meta, StoryObj } from "@storybook/react-vite";
import { UploadRecordModal } from "../../components/medical-records/UploadRecordModal";

const meta: Meta<typeof UploadRecordModal> = { title: "Medical Records/UploadRecordModal", component: UploadRecordModal };
export default meta;
type Story = StoryObj<typeof UploadRecordModal>;
export const Open: Story = { args: { isOpen: true, onClose: () => undefined } };