import os
from uuid import uuid4

import psycopg
from pwdlib import PasswordHash

DATABASE_URL = os.environ["DATABASE_URL"]
SUPER_ADMIN_EMAIL = os.environ["SUPER_ADMIN_EMAIL"]
SUPER_ADMIN_PASSWORD = os.environ["SUPER_ADMIN_PASSWORD"]
SUPER_ADMIN_NAME = os.getenv("SUPER_ADMIN_NAME", "Thinkare Super Admin")

password_hash = PasswordHash.recommended()
name_parts = SUPER_ADMIN_NAME.strip().split(maxsplit=1)
first_name = name_parts[0] if name_parts else "Thinkare"
last_name = name_parts[1] if len(name_parts) > 1 else "Super Admin"

with psycopg.connect(DATABASE_URL) as connection:
    role = connection.execute("SELECT id FROM roles WHERE name = 'PLATFORM_ADMIN'").fetchone()
    if not role:
        role = connection.execute("INSERT INTO roles (name) VALUES ('PLATFORM_ADMIN') RETURNING id").fetchone()

    existing_user = connection.execute("SELECT id FROM users WHERE email = %s", (SUPER_ADMIN_EMAIL,)).fetchone()
    if existing_user:
        raise SystemExit("A user already exists with SUPER_ADMIN_EMAIL.")

    connection.execute(
        """
        INSERT INTO users (id, role_id, first_name, last_name, email, password_hash, is_active, is_verified)
        VALUES (%s, %s, %s, %s, %s, %s, TRUE, TRUE)
        """,
        (str(uuid4()), role[0], first_name, last_name, SUPER_ADMIN_EMAIL, password_hash.hash(SUPER_ADMIN_PASSWORD)),
    )
    connection.commit()

print(f"Created PLATFORM_ADMIN account for {SUPER_ADMIN_EMAIL}")