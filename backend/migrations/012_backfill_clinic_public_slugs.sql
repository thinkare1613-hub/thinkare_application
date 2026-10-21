UPDATE clinics
SET public_slug = CONCAT(
    LEFT(COALESCE(NULLIF(TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-', 'g')), ''), 'clinic'), 80),
    '-',
    REPLACE(id::text, '-', '')
)
WHERE public_slug IS NULL OR BTRIM(public_slug) = '';
