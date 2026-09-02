import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppointmentForm } from "../../components/appointments/AppointmentForm";

const meta: Meta<typeof AppointmentForm> = {
  title: "Appointments/AppointmentForm",
  component: AppointmentForm,
};

export default meta;
type Story = StoryObj<typeof AppointmentForm>;

const patients = [
  { id: "p1", name: "Aarav Sharma" },
  { id: "p2", name: "Meera Iyer" },
];

const doctors = [
  { id: "d1", name: "Dr. Ananya Rao" },
  { id: "d2", name: "Dr. Kabir Menon" },
];

export const Default: Story = {
  args: {
    patients,
    doctors,
    form: {
      patient: "Aarav Sharma",
      doctor: "Dr. Ananya Rao",
      service: "Consultation",
      date: "2026-08-30",
      time: "09:00 AM",
    },
    onChange: () => undefined,
    onSubmit: () => undefined,
  },
};
