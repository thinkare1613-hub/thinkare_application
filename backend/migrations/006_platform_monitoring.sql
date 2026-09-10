ALTER TABLE clinics ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS registration_authority VARCHAR(255);

CREATE TABLE IF NOT EXISTS clinic_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    plan VARCHAR(40) NOT NULL DEFAULT 'BASIC',
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),
    started_on DATE NOT NULL DEFAULT CURRENT_DATE,
    renews_on DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (clinic_id)
);

CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES clinic_subscriptions(id) ON DELETE CASCADE,
    invoice_number VARCHAR(40) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    provider VARCHAR(100),
    transaction_reference VARCHAR(255),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_payment_status
    ON clinic_subscriptions (payment_status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status
    ON subscription_payments (status, paid_at DESC);