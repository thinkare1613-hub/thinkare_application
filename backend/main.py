import os
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from uuid import UUID, uuid4

import jwt
import psycopg
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres@localhost:5433/thinkare_booking_db"
)
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret")
JWT_ALGORITHM = "HS256"
password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer()

app = FastAPI(title="Thinkare Booking API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(LoginRequest):
    first_name: str
    last_name: str | None = None
    phone: str | None = None


class AvailabilityRequest(BaseModel):
    clinic_id: UUID
    day_of_week: int
    start_time: time
    end_time: time
    slot_duration_minutes: int = 15


class SlotRequest(BaseModel):
    doctor_id: UUID
    clinic_id: UUID
    slot_date: date
    start_time: time
    end_time: time


class BookingRequest(BaseModel):
    slot_id: UUID
    reason: str | None = None
    patient_notes: str | None = None


class PaymentRequest(BaseModel):
    appointment_id: UUID
    amount: Decimal
    transaction_reference: str | None = None


def create_token(user_id: str, role: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expires_at}, JWT_SECRET, algorithm=JWT_ALGORITHM
    )


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict[str, str]:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": payload["sub"], "role": payload["role"]}
    except (jwt.PyJWTError, KeyError) as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from error


def require_roles(*roles: str):
    def guard(user: dict[str, str] = Depends(current_user)) -> dict[str, str]:
        if user["role"] not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return guard


@app.get("/api/health")
def health() -> dict[str, str]:
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            database = connection.execute("SELECT current_database()").fetchone()[0]
        return {"status": "ok", "database": database}
    except psycopg.Error as error:
        raise HTTPException(status_code=503, detail="Database connection failed") from error


@app.post("/api/auth/login")
def login(credentials: LoginRequest) -> dict[str, object]:
    with psycopg.connect(DATABASE_URL) as connection:
        user = connection.execute(
            """
            SELECT users.id, users.password_hash, roles.name
            FROM users JOIN roles ON roles.id = users.role_id
            WHERE users.email = %s AND users.is_active = TRUE
            """,
            (credentials.email,),
        ).fetchone()
    if not user or not password_hash.verify(credentials.password, user[1]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return {
        "access_token": create_token(str(user[0]), user[2]),
        "token_type": "bearer",
        "user": {"id": str(user[0]), "email": credentials.email, "role": user[2]},
    }


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(account: RegisterRequest) -> dict[str, object]:
    with psycopg.connect(DATABASE_URL) as connection:
        role = connection.execute("SELECT id FROM roles WHERE name = 'PATIENT'").fetchone()
        try:
            user = connection.execute(
                """
                INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, FALSE)
                RETURNING id
                """,
                (role[0], account.first_name, account.last_name, account.email, account.phone, password_hash.hash(account.password)),
            ).fetchone()
            connection.execute("INSERT INTO patients (user_id) VALUES (%s)", (user[0],))
            connection.commit()
        except psycopg.errors.UniqueViolation as error:
            raise HTTPException(status_code=409, detail="An account already uses this email or phone") from error
    return {"id": str(user[0]), "email": account.email, "role": "PATIENT"}


@app.get("/api/auth/me")
def me(user: dict[str, str] = Depends(current_user)) -> dict[str, str]:
    return user


@app.get("/api/admin/users")
def list_users(
    _: dict[str, str] = Depends(require_roles("PLATFORM_ADMIN", "CLINIC_ADMIN")),
) -> list[dict[str, str]]:
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(
            "SELECT users.id, users.email, roles.name FROM users JOIN roles ON roles.id = users.role_id ORDER BY users.created_at DESC"
        ).fetchall()
    return [{"id": str(record[0]), "email": record[1], "role": record[2]} for record in records]


@app.get("/api/dashboard")
def dashboard(user: dict[str, str] = Depends(current_user)) -> dict[str, object]:
    today = datetime.now().date()
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            result = connection.execute(
                """
                SELECT
                    COUNT(*) FILTER (WHERE status IN ('PENDING', 'CONFIRMED')) AS scheduled,
                    COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed
                FROM appointments
                WHERE appointment_date = %s
                """,
                (today,),
            ).fetchone()
        return {"date": str(today), "scheduled": result[0], "confirmed": result[1], "role": user["role"]}
    except psycopg.Error as error:
        raise HTTPException(status_code=503, detail="Dashboard data is unavailable") from error


@app.get("/api/specialties")
def specialties() -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(
            "SELECT id, name, description FROM specialties WHERE is_active = TRUE ORDER BY name"
        ).fetchall()
    return [{"id": str(row[0]), "name": row[1], "description": row[2]} for row in records]


@app.get("/api/clinics")
def clinics() -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(
            "SELECT id, name, city, state, status FROM clinics WHERE status = 'APPROVED' ORDER BY name"
        ).fetchall()
    return [{"id": str(row[0]), "name": row[1], "city": row[2], "state": row[3], "status": row[4]} for row in records]


@app.get("/api/doctors")
def doctors(specialty_id: UUID | None = None) -> list[dict[str, object]]:
    query = """
        SELECT DISTINCT doctors.id, users.first_name, users.last_name, doctors.qualification,
               doctors.experience_years, doctors.consultation_fee
        FROM doctors JOIN users ON users.id = doctors.user_id
        LEFT JOIN doctor_specialties ON doctor_specialties.doctor_id = doctors.id
        WHERE doctors.is_active = TRUE AND (%s IS NULL OR doctor_specialties.specialty_id = %s)
        ORDER BY users.first_name, users.last_name
    """
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(query, (specialty_id, specialty_id)).fetchall()
    return [{"id": str(row[0]), "name": f"{row[1]} {row[2] or ''}".strip(), "qualification": row[3], "experience_years": row[4], "consultation_fee": row[5]} for row in records]


@app.post("/api/availability", status_code=status.HTTP_201_CREATED)
def create_availability(
    schedule: AvailabilityRequest,
    user: dict[str, str] = Depends(require_roles("DOCTOR")),
) -> dict[str, str]:
    with psycopg.connect(DATABASE_URL) as connection:
        doctor = connection.execute("SELECT id FROM doctors WHERE user_id = %s", (user["id"],)).fetchone()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        record = connection.execute(
            """INSERT INTO doctor_availability (doctor_id, clinic_id, day_of_week, start_time, end_time, slot_duration_minutes)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (doctor[0], schedule.clinic_id, schedule.day_of_week, schedule.start_time, schedule.end_time, schedule.slot_duration_minutes),
        ).fetchone()
        connection.commit()
    return {"id": str(record[0])}


@app.post("/api/slots", status_code=status.HTTP_201_CREATED)
def create_slot(
    slot: SlotRequest,
    _: dict[str, str] = Depends(require_roles("DOCTOR", "CLINIC_ADMIN")),
) -> dict[str, str]:
    with psycopg.connect(DATABASE_URL) as connection:
        try:
            record = connection.execute(
                """INSERT INTO appointment_slots (doctor_id, clinic_id, slot_date, start_time, end_time)
                   VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (slot.doctor_id, slot.clinic_id, slot.slot_date, slot.start_time, slot.end_time),
            ).fetchone()
            connection.commit()
        except psycopg.errors.UniqueViolation as error:
            raise HTTPException(status_code=409, detail="This slot already exists") from error
    return {"id": str(record[0])}


@app.get("/api/slots")
def available_slots(doctor_id: UUID, slot_date: date) -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(
            """SELECT id, clinic_id, start_time, end_time FROM appointment_slots
               WHERE doctor_id = %s AND slot_date = %s AND status = 'AVAILABLE' ORDER BY start_time""",
            (doctor_id, slot_date),
        ).fetchall()
    return [{"id": str(row[0]), "clinic_id": str(row[1]), "start_time": str(row[2]), "end_time": str(row[3])} for row in records]


@app.post("/api/appointments", status_code=status.HTTP_201_CREATED)
def book_appointment(
    booking: BookingRequest,
    user: dict[str, str] = Depends(require_roles("PATIENT")),
) -> dict[str, str]:
    with psycopg.connect(DATABASE_URL) as connection:
        patient = connection.execute("SELECT id FROM patients WHERE user_id = %s", (user["id"],)).fetchone()
        slot = connection.execute(
            """SELECT doctor_id, clinic_id, slot_date, start_time, end_time FROM appointment_slots
               WHERE id = %s AND status = 'AVAILABLE' FOR UPDATE""",
            (booking.slot_id,),
        ).fetchone()
        if not patient or not slot:
            raise HTTPException(status_code=409, detail="That appointment slot is no longer available")
        appointment_number = f"THK-{uuid4().hex[:10].upper()}"
        appointment = connection.execute(
            """INSERT INTO appointments (appointment_number, patient_id, doctor_id, clinic_id, slot_id, appointment_date, start_time, end_time, reason, patient_notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (appointment_number, patient[0], slot[0], slot[1], booking.slot_id, slot[2], slot[3], slot[4], booking.reason, booking.patient_notes),
        ).fetchone()
        connection.execute("UPDATE appointment_slots SET status = 'BOOKED' WHERE id = %s", (booking.slot_id,))
        connection.execute(
            """INSERT INTO notifications (user_id, appointment_id, type, title, message)
               VALUES (%s, %s, 'IN_APP', 'Booking confirmation', 'Your appointment request has been received.')""",
            (user["id"], appointment[0]),
        )
        connection.commit()
    return {"id": str(appointment[0]), "appointment_number": appointment_number}


@app.post("/api/payments", status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: PaymentRequest,
    _: dict[str, str] = Depends(require_roles("PATIENT", "CLINIC_ADMIN")),
) -> dict[str, str]:
    with psycopg.connect(DATABASE_URL) as connection:
        try:
            record = connection.execute(
                """INSERT INTO payments (appointment_id, amount, transaction_reference)
                   VALUES (%s, %s, %s) RETURNING id, status""",
                (payment.appointment_id, payment.amount, payment.transaction_reference),
            ).fetchone()
            connection.commit()
        except psycopg.errors.UniqueViolation as error:
            raise HTTPException(status_code=409, detail="A payment already exists for this appointment") from error
    return {"id": str(record[0]), "status": record[1]}


@app.get("/api/notifications")
def notifications(user: dict[str, str] = Depends(current_user)) -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(
            """SELECT id, title, message, type, is_read, created_at FROM notifications
               WHERE user_id = %s ORDER BY created_at DESC""",
            (user["id"],),
        ).fetchall()
    return [{"id": str(row[0]), "title": row[1], "message": row[2], "type": row[3], "is_read": row[4], "created_at": row[5]} for row in records]