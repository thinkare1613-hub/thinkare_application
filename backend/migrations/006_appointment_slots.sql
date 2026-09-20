CREATE TABLE IF NOT EXISTS appointment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (status IN ('AVAILABLE', 'BOOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (doctor_id, slot_date, start_time)
);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_number VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES appointment_slots(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_notes TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_number
    ON appointments (appointment_number)
    WHERE appointment_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_slots_lookup
    ON appointment_slots (doctor_id, slot_date, status, start_time);
