ALTER TABLE doctors ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors (clinic_id);