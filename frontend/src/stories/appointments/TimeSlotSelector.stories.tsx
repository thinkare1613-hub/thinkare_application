import type { Meta, StoryObj } from "@storybook/react";
import { TimeSlotSelector } from "../../components/appointments/TimeSlotSelector";

const meta: Meta<typeof TimeSlotSelector> = {
  title: "Appointments/TimeSlotSelector",
  component: TimeSlotSelector,
};

export default meta;
type Story = StoryObj<typeof TimeSlotSelector>;

export const Default: Story = {
  args: {
    value: "09:00 AM",
    onChange: () => undefined,
    slots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:15 PM", "03:30 PM"],
  },
};
