
import os
from pathlib import Path
import psycopg

if os.getenv("CONFIRM_THINKARE_MIGRATIONS") != "YES":
    raise SystemExit("Migration not confirmed.")

database_url = os.getenv("DATABASE_URL", "")
if not database_url:
    raise SystemExit("DATABASE_URL is not configured.")

if "localhost" in database_url or "127.0.0.1" in database_url:
    raise SystemExit("Refusing to run against a local database.")

migration_dir = Path(__file__).resolve().parent / "migrations"

migration_order = [
    "002_clinic_tenant_schema.sql",
    "004_clinic_public_slug.sql",
    "012_backfill_clinic_public_slugs.sql",
    "003_medical_records.sql",
    "005_invoices.sql",
    "006_appointment_slots.sql",
    "006_platform_monitoring.sql",
    "007_schema_compatibility.sql",
    "008_persistent_doctors.sql",
    "009_wearable_health.sql",
    "010_wearable_health_connect.sql",
    "011_fire_boltt_provider.sql",
    "001_payments.sql",
]

with psycopg.connect(database_url) as connection:
    with connection.cursor() as cursor:
        cursor.execute("SELECT current_database()")
        print("Connected to database:", cursor.fetchone()[0])

        for filename in migration_order:
            path = migration_dir / filename
            if not path.is_file():
                raise SystemExit(f"Missing migration: {filename}")

            print("Applying:", filename)
            cursor.execute(path.read_text(encoding="utf-8"), prepare=False)

        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'clinics'
              AND column_name = 'public_slug'
        """)
        if not cursor.fetchone():
            raise RuntimeError("clinics.public_slug was not created")

        cursor.execute("""
            SELECT id
            FROM clinics
            WHERE public_slug IS NULL OR BTRIM(public_slug) = ''
            LIMIT 1
        """)
        if cursor.fetchone():
            raise RuntimeError("Some clinics are missing public booking slugs")

print("Migration completed successfully.")
