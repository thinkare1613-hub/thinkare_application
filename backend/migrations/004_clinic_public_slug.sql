ALTER TABLE clinics ADD COLUMN IF NOT EXISTS public_slug VARCHAR(120);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_public_slug ON clinics (public_slug) WHERE public_slug IS NOT NULL;