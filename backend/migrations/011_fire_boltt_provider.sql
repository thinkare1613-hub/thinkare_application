UPDATE wearable_consents AS current_provider
SET consent_version = previous_provider.consent_version,
    granted_at = previous_provider.granted_at,
    revoked_at = previous_provider.revoked_at,
    updated_at = GREATEST(current_provider.updated_at, previous_provider.updated_at)
FROM wearable_consents AS previous_provider
WHERE current_provider.patient_id = previous_provider.patient_id
  AND current_provider.provider = 'fire_boltt'
  AND previous_provider.provider = 'fitbit'
  AND previous_provider.updated_at > current_provider.updated_at;

DELETE FROM wearable_consents AS previous_provider
USING wearable_consents AS current_provider
WHERE previous_provider.patient_id = current_provider.patient_id
  AND previous_provider.provider = 'fitbit'
  AND current_provider.provider = 'fire_boltt';

UPDATE wearable_consents SET provider = 'fire_boltt' WHERE provider = 'fitbit';
ALTER TABLE wearable_consents ALTER COLUMN provider SET DEFAULT 'fire_boltt';

UPDATE wearable_connections AS current_provider
SET access_token_ciphertext = COALESCE(current_provider.access_token_ciphertext, previous_provider.access_token_ciphertext),
    refresh_token_ciphertext = COALESCE(current_provider.refresh_token_ciphertext, previous_provider.refresh_token_ciphertext),
    connected_at = COALESCE(current_provider.connected_at, previous_provider.connected_at),
    last_sync_at = GREATEST(current_provider.last_sync_at, previous_provider.last_sync_at),
    connection_method = COALESCE(current_provider.connection_method, previous_provider.connection_method),
    updated_at = GREATEST(current_provider.updated_at, previous_provider.updated_at)
FROM wearable_connections AS previous_provider
WHERE current_provider.patient_id = previous_provider.patient_id
  AND current_provider.provider = 'fire_boltt'
  AND previous_provider.provider = 'fitbit';

DELETE FROM wearable_connections AS previous_provider
USING wearable_connections AS current_provider
WHERE previous_provider.patient_id = current_provider.patient_id
  AND previous_provider.provider = 'fitbit'
  AND current_provider.provider = 'fire_boltt';

UPDATE wearable_connections SET provider = 'fire_boltt' WHERE provider = 'fitbit';
ALTER TABLE wearable_connections ALTER COLUMN provider SET DEFAULT 'fire_boltt';

DELETE FROM wearable_health_metrics AS previous_provider
USING wearable_health_metrics AS current_provider
WHERE previous_provider.patient_id = current_provider.patient_id
  AND previous_provider.provider = 'fitbit'
  AND current_provider.provider = 'fire_boltt'
  AND previous_provider.metric_type = current_provider.metric_type
  AND previous_provider.recorded_at = current_provider.recorded_at;

UPDATE wearable_health_metrics SET provider = 'fire_boltt' WHERE provider = 'fitbit';
ALTER TABLE wearable_health_metrics ALTER COLUMN provider SET DEFAULT 'fire_boltt';
