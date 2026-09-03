CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    diagnosis TEXT,
    prescription_count INTEGER,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    attachment_name VARCHAR(255),
    attachment_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medical_records_clinic_patient_date
    ON medical_records (clinic_id, patient_id, record_date DESC);