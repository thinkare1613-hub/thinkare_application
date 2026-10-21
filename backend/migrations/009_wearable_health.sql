CREATE TABLE IF NOT EXISTS wearable_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL DEFAULT 'fitbit',
    consent_version VARCHAR(40) NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (patient_id, provider)
);

CREATE TABLE IF NOT EXISTS wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL DEFAULT 'fitbit',
    access_token_ciphertext TEXT,
    refresh_token_ciphertext TEXT,
    connected_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (patient_id, provider)
);

CREATE TABLE IF NOT EXISTS wearable_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL DEFAULT 'fitbit',
    metric_type VARCHAR(50) NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (patient_id, provider, metric_type, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_wearable_patient_recorded
    ON wearable_health_metrics (patient_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_wearable_connections_patient_provider
    ON wearable_connections (patient_id, provider);
