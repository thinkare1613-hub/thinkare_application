ALTER TABLE wearable_connections
    ADD COLUMN IF NOT EXISTS connection_method VARCHAR(30);
