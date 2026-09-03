import os
import re
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid4

import jwt
import psycopg
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
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
UPLOAD_DIRECTORY = Path(os.getenv("MEDICAL_RECORD_UPLOAD_DIRECTORY", "uploads/medical-records"))
ALLOWED_RECORD_CATEGORIES = {"Lab Reports", "Prescriptions", "Visit Summaries", "Diagnoses", "Imaging", "Other"}

DEMO_CLINICS: dict[str, dict[str, str | bool]] = {
    "clinic-demo-1": {
        "id": "clinic-demo-1",
        "name": "ABC Dental Clinic",
        "logo_url": "",
        "email": "hello@abcdental.com",
        "phone": "+91 98765 43210",
        "address": "MG Road, Bengaluru",
        "status": "active",
    }
}
DEMO_USERS: dict[str, dict[str, str]] = {
    "admin@gmail.com": {
        "id": "user-demo-admin",
        "clinic_id": "clinic-demo-1",
        "email": "admin@gmail.com",
        "role": "clinic_admin",
        "password_hash": password_hash.hash("admin@123"),
    }
}

app = FastAPI(title="Thinkare Booking API", version="0.1.0")
allowed_origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "https://thinkare-application-1.onrender.com",
}
configured_origin = os.getenv("FRONTEND_ORIGIN")
if configured_origin:
    allowed_origins.add(configured_origin)

additional_origins = os.getenv("ALLOWED_FRONTEND_ORIGINS", "")
if additional_origins:
    for origin in additional_origins.split(","):
        value = origin.strip()
        if value:
            allowed_origins.add(value)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_origin_regex=r"https://.*\.onrender\.com|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ClinicRegisterRequest(BaseModel):
    clinic_name: str
    admin_name: str
    email: EmailStr
    phone: str | None = None
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

    '''
    @app.get("/api/medical-records")
    def list_medical_records(
        patient_id: UUID | None = None,
        category: str | None = None,
        search: str | None = None,
        user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
    ) -> list[dict[str, object]]:
        if category and category not in ALLOWED_RECORD_CATEGORIES:
            raise HTTPException(status_code=400, detail="Unsupported medical record category")

        with psycopg.connect(DATABASE_URL) as connection:
            resolved_patient_id = patient_id
            if user["role"] == "PATIENT":
                patient = connection.execute("SELECT id FROM patients WHERE user_id = %s AND clinic_id = %s", (user["id"], user["clinic_id"])).fetchone()
                if not patient:
                    return []
                resolved_patient_id = patient[0]

            query = """
                SELECT id, clinic_id, patient_id, doctor_id, category, title, summary, diagnosis,
                       prescription_count, record_date, attachment_name, created_at
                FROM medical_records WHERE clinic_id = %s
            """
            params: list[object] = [user["clinic_id"]]
            if resolved_patient_id:
                query += " AND patient_id = %s"
                params.append(resolved_patient_id)
            if category:
                query += " AND category = %s"
                params.append(category)
            if search:
                query += " AND (title ILIKE %s OR summary ILIKE %s OR diagnosis ILIKE %s)"
                term = f"%{search.strip()}%"
                params.extend([term, term, term])
            query += " ORDER BY record_date DESC, created_at DESC"
            rows = connection.execute(query, tuple(params)).fetchall()

        return [{"id": str(row[0]), "clinic_id": str(row[1]), "patient_id": str(row[2]), "doctor_id": str(row[3]) if row[3] else None, "category": row[4], "title": row[5], "summary": row[6], "diagnosis": row[7], "prescription_count": row[8], "record_date": str(row[9]), "attachment_name": row[10], "created_at": row[11].isoformat()} for row in rows]


    @app.get("/api/medical-records/{record_id}")
    def get_medical_record(
        record_id: UUID,
        user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
    ) -> dict[str, object]:
        with psycopg.connect(DATABASE_URL) as connection:
            record = connection.execute("""SELECT id, clinic_id, patient_id, doctor_id, category, title, summary, diagnosis, prescription_count, record_date, attachment_name, attachment_path, created_at FROM medical_records WHERE id = %s""", (record_id,)).fetchone()
            if not record:
                raise HTTPException(status_code=404, detail="Medical record not found")
            ensure_record_access(record, user, connection)
        return {"id": str(record[0]), "clinic_id": str(record[1]), "patient_id": str(record[2]), "doctor_id": str(record[3]) if record[3] else None, "category": record[4], "title": record[5], "summary": record[6], "diagnosis": record[7], "prescription_count": record[8], "record_date": str(record[9]), "attachment_name": record[10], "has_attachment": bool(record[11]), "created_at": record[12].isoformat()}


    @app.post("/api/patients/{patient_id}/medical-records", status_code=status.HTTP_201_CREATED)
    def upload_medical_record(
        patient_id: UUID,
        category: str = Form(...),
        title: str = Form(...),
        record_date: date = Form(...),
        summary: str | None = Form(None),
        diagnosis: str | None = Form(None),
        prescription_count: int | None = Form(None),
        file: UploadFile | None = File(None),
        user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR")),
    ) -> dict[str, object]:
        if category not in ALLOWED_RECORD_CATEGORIES:
            raise HTTPException(status_code=400, detail="Unsupported medical record category")
        if not title.strip():
            raise HTTPException(status_code=400, detail="Record title is required")

        with psycopg.connect(DATABASE_URL) as connection:
            patient = connection.execute("SELECT clinic_id FROM patients WHERE id = %s", (patient_id,)).fetchone()
            if not patient:
                raise HTTPException(status_code=404, detail="Patient not found")
            ensure_same_clinic(user, patient[0], field_name="patient.clinic_id")

            attachment_name = None
            attachment_path = None
            if file and file.filename:
                suffix = Path(file.filename).suffix.lower()
                if suffix not in {".pdf", ".png", ".jpg", ".jpeg"}:
                    raise HTTPException(status_code=400, detail="Only PDF, PNG, and JPG files are supported")
                UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
                attachment_name = Path(file.filename).name
                saved_path = UPLOAD_DIRECTORY / f"{uuid4().hex}{suffix}"
                saved_path.write_bytes(file.file.read())
                attachment_path = str(saved_path)

            record = connection.execute("""INSERT INTO medical_records (clinic_id, patient_id, category, title, summary, diagnosis, prescription_count, record_date, attachment_name, attachment_path) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""", (user["clinic_id"], patient_id, category, title.strip(), summary, diagnosis, prescription_count, record_date, attachment_name, attachment_path)).fetchone()
            connection.commit()
        return {"id": str(record[0]), "patient_id": str(patient_id), "category": category, "title": title.strip(), "attachment_name": attachment_name}


    @app.get("/api/medical-records/{record_id}/download")
    def download_medical_record(
        record_id: UUID,
        user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
    ) -> FileResponse:
        with psycopg.connect(DATABASE_URL) as connection:
            record = connection.execute("SELECT id, clinic_id, patient_id, attachment_name, attachment_path FROM medical_records WHERE id = %s", (record_id,)).fetchone()
            if not record:
                raise HTTPException(status_code=404, detail="Medical record not found")
            ensure_record_access((record[0], record[1], record[2]), user, connection)
        if not record[4] or not Path(record[4]).is_file():
            raise HTTPException(status_code=404, detail="Record attachment is unavailable")
        return FileResponse(path=record[4], filename=record[3] or "medical-record")

    '''
    patient_notes: str | None = None


class PaymentRequest(BaseModel):
    appointment_id: UUID
    amount: Decimal
    transaction_reference: str | None = None


class InvoiceCreateRequest(BaseModel):
    patient_id: UUID | None = None
    appointment_id: UUID | None = None
    subtotal: Decimal
    discount: Decimal = Decimal("0")
    tax: Decimal = Decimal("0")
    status: str = "UNPAID"
    payment_method: str = "CASH"


def validate_same_clinic_patient_doctor(patient_id: UUID, doctor_id: UUID, connection) -> None:
    patient = connection.execute(
        "SELECT clinic_id FROM patients WHERE id = %s",
        (str(patient_id),),
    ).fetchone()
    doctor = connection.execute(
        "SELECT clinic_id FROM doctors WHERE id = %s",
        (str(doctor_id),),
    ).fetchone()

    if not patient or not doctor:
        raise HTTPException(status_code=404, detail="Patient or doctor not found")

    if str(patient[0]) != str(doctor[0]):
        raise HTTPException(
            status_code=400,
            detail="This patient can only be assigned to a doctor from the same clinic.",
        )


def create_token(user_id: str, role: str, clinic_id: str | None = None) -> str:
    normalized_role = str(role).upper()
    payload: dict[str, str | float] = {"sub": user_id, "role": normalized_role, "exp": datetime.now(timezone.utc) + timedelta(hours=8)}
    if clinic_id:
        payload["clinic_id"] = clinic_id
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict[str, str]:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = {"id": str(payload["sub"]), "role": str(payload["role"]).upper()}
        clinic_id = payload.get("clinic_id")
        if clinic_id:
            user["clinic_id"] = str(clinic_id)
        return user
    except (jwt.PyJWTError, KeyError) as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from error


def require_roles(*roles: str):
    def guard(user: dict[str, str] = Depends(current_user)) -> dict[str, str]:
        if user["role"] not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return guard


def require_clinic_context(*roles: str):
    def guard(user: dict[str, str] = Depends(require_roles(*roles))) -> dict[str, str]:
        if not user.get("clinic_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Clinic context is required for this operation.",
            )
        return user

    return guard


def clinic_scope_clause(user: dict[str, str] | None = None) -> tuple[str, list[str]]:
    if not user or not user.get("clinic_id"):
        return "", []
    return " AND clinic_id = %s ", [str(user["clinic_id"])]


def ensure_same_clinic(user: dict[str, str], clinic_id: str | UUID | None, *, field_name: str = "clinic_id") -> None:
    if clinic_id is None:
        raise HTTPException(status_code=400, detail=f"{field_name} is required")
    if user.get("clinic_id") and str(user["clinic_id"]) != str(clinic_id):
        raise HTTPException(status_code=403, detail="This resource belongs to another clinic")


def clinic_slug(clinic_name: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", clinic_name.lower()).strip("-")
    return f"{normalized[:90] or 'clinic'}-{uuid4().hex[:8]}"


def ensure_record_access(record: tuple[object, ...], user: dict[str, str], connection) -> None:
    ensure_same_clinic(user, record[1], field_name="record.clinic_id")
    if user["role"] == "PATIENT":
        patient = connection.execute("SELECT id FROM patients WHERE user_id = %s", (user["id"],)).fetchone()
        if not patient or str(patient[0]) != str(record[2]):
            raise HTTPException(status_code=403, detail="You can only access your own medical records")


@app.get("/api/medical-records")
def list_medical_records(
    patient_id: UUID | None = None,
    category: str | None = None,
    search: str | None = None,
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
) -> list[dict[str, object]]:
    if category and category not in ALLOWED_RECORD_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unsupported medical record category")
    if user["clinic_id"] in DEMO_CLINICS:
        return []

    with psycopg.connect(DATABASE_URL) as connection:
        if user["role"] == "PATIENT":
            patient = connection.execute("SELECT id FROM patients WHERE user_id = %s AND clinic_id = %s", (user["id"], user["clinic_id"])).fetchone()
            if not patient:
                return []
            patient_id = patient[0]
        query = "SELECT id, clinic_id, patient_id, category, title, summary, diagnosis, prescription_count, record_date, attachment_name FROM medical_records WHERE clinic_id = %s"
        params: list[object] = [user["clinic_id"]]
        if patient_id:
            query += " AND patient_id = %s"; params.append(patient_id)
        if category:
            query += " AND category = %s"; params.append(category)
        if search:
            term = f"%{search.strip()}%"; query += " AND (title ILIKE %s OR summary ILIKE %s)"; params.extend([term, term])
        rows = connection.execute(query + " ORDER BY record_date DESC", tuple(params)).fetchall()
    return [{"id": str(row[0]), "clinic_id": str(row[1]), "patient_id": str(row[2]), "category": row[3], "title": row[4], "summary": row[5], "diagnosis": row[6], "prescription_count": row[7], "record_date": str(row[8]), "attachment_name": row[9]} for row in rows]


@app.get("/api/medical-records/{record_id}")
def get_medical_record(record_id: UUID, user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT"))) -> dict[str, object]:
    with psycopg.connect(DATABASE_URL) as connection:
        record = connection.execute("SELECT id, clinic_id, patient_id, category, title, summary, diagnosis, prescription_count, record_date, attachment_name, attachment_path FROM medical_records WHERE id = %s", (record_id,)).fetchone()
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        ensure_record_access(record, user, connection)
    return {"id": str(record[0]), "clinic_id": str(record[1]), "patient_id": str(record[2]), "category": record[3], "title": record[4], "summary": record[5], "diagnosis": record[6], "prescription_count": record[7], "record_date": str(record[8]), "attachment_name": record[9], "has_attachment": bool(record[10])}


@app.post("/api/patients/{patient_id}/medical-records", status_code=status.HTTP_201_CREATED)
def upload_medical_record(patient_id: UUID, category: str = Form(...), title: str = Form(...), record_date: date = Form(...), summary: str | None = Form(None), diagnosis: str | None = Form(None), prescription_count: int | None = Form(None), file: UploadFile | None = File(None), user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR"))) -> dict[str, object]:
    if category not in ALLOWED_RECORD_CATEGORIES or not title.strip():
        raise HTTPException(status_code=400, detail="A supported category and record title are required")
    with psycopg.connect(DATABASE_URL) as connection:
        patient = connection.execute("SELECT clinic_id FROM patients WHERE id = %s", (patient_id,)).fetchone()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        ensure_same_clinic(user, patient[0], field_name="patient.clinic_id")
        attachment_name = attachment_path = None
        if file and file.filename:
            suffix = Path(file.filename).suffix.lower()
            if suffix not in {".pdf", ".png", ".jpg", ".jpeg"}:
                raise HTTPException(status_code=400, detail="Only PDF, PNG, and JPG files are supported")
            UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
            attachment_name = Path(file.filename).name
            saved_file = UPLOAD_DIRECTORY / f"{uuid4().hex}{suffix}"
            saved_file.write_bytes(file.file.read())
            attachment_path = str(saved_file)
        record = connection.execute("INSERT INTO medical_records (clinic_id, patient_id, category, title, summary, diagnosis, prescription_count, record_date, attachment_name, attachment_path) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id", (user["clinic_id"], patient_id, category, title.strip(), summary, diagnosis, prescription_count, record_date, attachment_name, attachment_path)).fetchone()
        connection.commit()
    return {"id": str(record[0]), "patient_id": str(patient_id), "title": title.strip(), "attachment_name": attachment_name}


@app.get("/api/medical-records/{record_id}/download")
def download_medical_record(record_id: UUID, user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT"))) -> FileResponse:
    with psycopg.connect(DATABASE_URL) as connection:
        record = connection.execute("SELECT id, clinic_id, patient_id, attachment_name, attachment_path FROM medical_records WHERE id = %s", (record_id,)).fetchone()
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        ensure_record_access(record, user, connection)
    if not record[4] or not Path(record[4]).is_file():
        raise HTTPException(status_code=404, detail="Record attachment is unavailable")
    return FileResponse(record[4], filename=record[3] or "medical-record")


@app.get("/api/health")
def health() -> dict[str, str]:
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            database = connection.execute("SELECT current_database()").fetchone()[0]
        return {"status": "ok", "database": database}
    except psycopg.Error as error:
        raise HTTPException(status_code=503, detail="Database connection failed") from error


@app.get("/api/public/clinics/{public_slug}")
def public_clinic(public_slug: str) -> dict[str, str]:
    with psycopg.connect(DATABASE_URL) as connection:
        clinic = connection.execute(
            "SELECT name FROM clinics WHERE public_slug = %s AND status = 'APPROVED'",
            (public_slug,),
        ).fetchone()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic booking page not found")
    return {"name": clinic[0], "logo_url": "", "address": ""}


@app.post("/api/auth/login")
def login(credentials: LoginRequest) -> dict[str, object]:
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            user = connection.execute(
                """
                SELECT users.id, users.password_hash, roles.name, clinics.id, clinics.name
                FROM users
                JOIN roles ON roles.id = users.role_id
                LEFT JOIN clinic_admins ON clinic_admins.user_id = users.id
                LEFT JOIN clinics ON clinics.id = clinic_admins.clinic_id
                WHERE users.email = %s AND users.is_active = TRUE
                """,
                (credentials.email,),
            ).fetchone()
        if user and password_hash.verify(credentials.password, user[1]):
            clinic_id = str(user[3]) if user[3] else None
            clinic_name = user[4] if user[4] else None
            return {
                "access_token": create_token(str(user[0]), user[2], clinic_id),
                "token_type": "bearer",
                "user": {
                    "id": str(user[0]),
                    "email": credentials.email,
                    "role": user[2],
                    "clinic_id": clinic_id,
                    "clinic_name": clinic_name,
                },
            }
    except Exception:
        pass

    demo_user = DEMO_USERS.get(credentials.email)
    if demo_user and password_hash.verify(credentials.password, demo_user["password_hash"]):
        clinic = DEMO_CLINICS.get(demo_user["clinic_id"], {})
        role = str(demo_user["role"]).upper()
        return {
            "access_token": create_token(demo_user["id"], role, str(demo_user["clinic_id"])),
            "token_type": "bearer",
            "user": {
                "id": demo_user["id"],
                "email": credentials.email,
                "role": role,
                "clinic_id": demo_user["clinic_id"],
                "clinic_name": clinic.get("name", "Clinic Workspace"),
            },
        }

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")


@app.post("/api/auth/register-clinic", status_code=status.HTTP_201_CREATED)
def register_clinic(account: ClinicRegisterRequest) -> dict[str, object]:
    clinic_id = str(uuid4())
    user_id = str(uuid4())
    public_slug = clinic_slug(account.clinic_name)
    hashed_password = password_hash.hash(account.password)

    try:
        with psycopg.connect(DATABASE_URL) as connection:
            role = connection.execute("SELECT id FROM roles WHERE name = 'CLINIC_ADMIN'").fetchone()
            if not role:
                raise HTTPException(status_code=500, detail="CLINIC_ADMIN role is not configured")

            clinic_record = connection.execute(
                """
                INSERT INTO clinics (id, name, email, phone, address_line1, status, public_slug)
                VALUES (%s, %s, %s, %s, %s, 'APPROVED', %s)
                RETURNING id
                """,
                (clinic_id, account.clinic_name, str(account.email), account.phone or "", "", public_slug),
            ).fetchone()

            connection.execute(
                """
                INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, is_active, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, TRUE)
                """,
                (user_id, role[0], account.admin_name, "", str(account.email), account.phone or "", hashed_password),
            )

            connection.execute(
                """
                INSERT INTO clinic_admins (clinic_id, user_id)
                VALUES (%s, %s)
                """,
                (clinic_record[0], user_id),
            )
            connection.execute("UPDATE clinics SET created_by = %s WHERE id = %s", (user_id, clinic_record[0]))
            connection.commit()

            return {
                "id": str(clinic_record[0]),
                "clinic_name": account.clinic_name,
                "admin_name": account.admin_name,
                "email": str(account.email),
                "status": "active",
                "public_slug": public_slug,
            }
    except psycopg.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="A clinic or admin account already exists for this email")
    except Exception:
        pass

    DEMO_CLINICS[clinic_id] = {
        "id": clinic_id,
        "name": account.clinic_name,
        "logo_url": "",
        "email": str(account.email),
        "phone": account.phone or "",
        "address": "",
        "status": "active",
    }
    DEMO_USERS[str(account.email)] = {
        "id": user_id,
        "clinic_id": clinic_id,
        "email": str(account.email),
        "role": "CLINIC_ADMIN",
        "password_hash": hashed_password,
    }
    return {
        "id": clinic_id,
        "clinic_name": account.clinic_name,
        "admin_name": account.admin_name,
        "email": str(account.email),
        "status": "active",
        "public_slug": public_slug,
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
def dashboard(user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT"))) -> dict[str, object]:
    today = datetime.now().date()
    scope_sql, scope_params = clinic_scope_clause(user)
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            query = """
                SELECT
                    COUNT(*) FILTER (WHERE status IN ('PENDING', 'CONFIRMED')) AS scheduled,
                    COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed
                FROM appointments
                WHERE appointment_date = %s
                """ + scope_sql
            params: tuple[object, ...] = (today, *scope_params)
            result = connection.execute(query, params).fetchone()
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
def clinics(user: dict[str, str] = Depends(current_user)) -> list[dict[str, object]]:
    query = "SELECT id, name, city, state, status FROM clinics WHERE status = 'APPROVED'"
    params: list[object] = []
    if user.get("clinic_id"):
        query += " AND id = %s"
        params.append(str(user["clinic_id"]))
    query += " ORDER BY name"
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(query, tuple(params)).fetchall()
    return [{"id": str(row[0]), "name": row[1], "city": row[2], "state": row[3], "status": row[4]} for row in records]


@app.get("/api/clinics/me")
def current_clinic_profile(user: dict[str, str] = Depends(require_roles("CLINIC_ADMIN"))) -> dict[str, object]:
    clinic_id = user.get("clinic_id")
    if not clinic_id:
        raise HTTPException(status_code=400, detail="Clinic context is missing for this admin account")

    try:
        with psycopg.connect(DATABASE_URL) as connection:
            record = connection.execute(
                """
                SELECT id, name, email, phone, address, logo_url, status
                FROM clinics
                WHERE id = %s
                """,
                (clinic_id,),
            ).fetchone()
    except psycopg.Error as error:
        raise HTTPException(status_code=503, detail="Clinic profile is unavailable") from error

    if not record:
        fallback = DEMO_CLINICS.get(clinic_id)
        if not fallback:
            raise HTTPException(status_code=404, detail="Clinic not found")
        return {
            "id": str(fallback["id"]),
            "name": str(fallback["name"]),
            "email": str(fallback["email"]),
            "phone": str(fallback["phone"]),
            "address": str(fallback["address"]),
            "logo_url": str(fallback.get("logo_url", "")),
            "status": str(fallback["status"]),
        }

    return {
        "id": str(record[0]),
        "name": record[1],
        "email": record[2],
        "phone": record[3],
        "address": record[4],
        "logo_url": record[5],
        "status": record[6],
    }


@app.get("/api/doctors")
def doctors(
    specialty_id: UUID | None = None,
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
) -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        if user["role"] == "PATIENT":
            patient = connection.execute(
                "SELECT id, clinic_id FROM patients WHERE user_id = %s",
                (user["id"],),
            ).fetchone()
            if not patient:
                return []
            doctor_records = connection.execute(
                """
                SELECT DISTINCT a.doctor_id
                FROM appointments a
                WHERE a.patient_id = %s AND a.clinic_id = %s
                ORDER BY a.appointment_date DESC, a.start_time DESC
                """,
                (patient[0], str(patient[1])),
            ).fetchall()
            if not doctor_records:
                return []
            doctor_ids = [row[0] for row in doctor_records]
            placeholders = ", ".join(["%s"] * len(doctor_ids))
            query = f"""
                SELECT DISTINCT doctors.id, users.first_name, users.last_name, doctors.qualification,
                       doctors.experience_years, doctors.consultation_fee
                FROM doctors JOIN users ON users.id = doctors.user_id
                LEFT JOIN doctor_specialties ON doctor_specialties.doctor_id = doctors.id
                WHERE doctors.is_active = TRUE
                  AND doctors.id IN ({placeholders})
                  AND (%s IS NULL OR doctor_specialties.specialty_id = %s)
                ORDER BY users.first_name, users.last_name
            """
            params: list[object] = [*doctor_ids, specialty_id, specialty_id]
            records = connection.execute(query, tuple(params)).fetchall()
            return [{"id": str(row[0]), "name": f"{row[1]} {row[2] or ''}".strip(), "qualification": row[3], "experience_years": row[4], "consultation_fee": row[5]} for row in records]

        query = """
            SELECT DISTINCT doctors.id, users.first_name, users.last_name, doctors.qualification,
                   doctors.experience_years, doctors.consultation_fee
            FROM doctors JOIN users ON users.id = doctors.user_id
            LEFT JOIN doctor_specialties ON doctor_specialties.doctor_id = doctors.id
            WHERE doctors.is_active = TRUE AND (%s IS NULL OR doctor_specialties.specialty_id = %s)
        """
        params: list[object] = [specialty_id, specialty_id]
        scope_sql, scope_params = clinic_scope_clause(user)
        if scope_sql:
            query += scope_sql
            params.extend(scope_params)
        query += " ORDER BY users.first_name, users.last_name "

        records = connection.execute(query, tuple(params)).fetchall()
    return [{"id": str(row[0]), "name": f"{row[1]} {row[2] or ''}".strip(), "qualification": row[3], "experience_years": row[4], "consultation_fee": row[5]} for row in records]


def _doctor_response(record: dict[str, object]) -> dict[str, object]:
    return {
        "id": str(record.get("id") or ""),
        "name": str(record.get("name") or ""),
        "email": str(record.get("email") or ""),
        "phone": str(record.get("phone") or ""),
        "specialization": str(record.get("specialization") or record.get("specialty") or "General Medicine"),
        "qualification": str(record.get("qualification") or ""),
        "license_number": str(record.get("license_number") or ""),
        "experience": str(record.get("experience") or record.get("experience_years") or ""),
        "profile_photo": str(record.get("profile_photo") or (str(record.get("name", "")).split()[0][:2].upper() if record.get("name") else "DR")),
        "consultation_fee": record.get("consultation_fee") if record.get("consultation_fee") is not None else 0,
        "status": str(record.get("status") or "Available"),
        "availability": str(record.get("availability") or "Available today"),
        "rating": float(record.get("rating") or 4.8),
        "clinic_id": str(record.get("clinic_id") or ""),
    }


if not hasattr(app.state, "doctor_store"):
    app.state.doctor_store = [
        {
            "id": "doc-1",
            "name": "Dr. Ananya Rao",
            "email": "ananya@abcdental.com",
            "phone": "+91 98765 12345",
            "specialization": "Cardiology",
            "qualification": "MD (Cardiology)",
            "license_number": "KMC-CRD-2048",
            "experience": "12 years",
            "profile_photo": "AR",
            "consultation_fee": 1200,
            "status": "Available",
            "availability": "Available today",
            "rating": 4.9,
            "clinic_id": "clinic-demo-1",
        },
        {
            "id": "doc-2",
            "name": "Dr. Kabir Menon",
            "email": "kabir@abcdental.com",
            "phone": "+91 98765 67890",
            "specialization": "Dermatology",
            "qualification": "MBBS, MD (Dermatology)",
            "license_number": "KMC-DER-1176",
            "experience": "9 years",
            "profile_photo": "KM",
            "consultation_fee": 950,
            "status": "Available",
            "availability": "Next slot 1:00 PM",
            "rating": 4.8,
            "clinic_id": "clinic-demo-1",
        },
    ]


@app.post("/api/doctors", status_code=status.HTTP_201_CREATED)
def create_doctor(
    payload: dict[str, object],
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN")),
) -> dict[str, object]:
    clinic_id = str(user["clinic_id"])
    doctor_name = str(payload.get("name") or "").strip()
    if not doctor_name:
        raise HTTPException(status_code=400, detail="Doctor name is required")

    doctor_id = str(payload.get("id") or f"doc-{uuid4().hex[:8]}")
    doctor_record = {
        "id": doctor_id,
        "name": doctor_name,
        "email": str(payload.get("email") or f"{doctor_name.lower().replace(' ', '.')}@clinic.com"),
        "phone": str(payload.get("phone") or "+91 90000 00000"),
        "specialization": str(payload.get("specialization") or payload.get("specialty") or "General Medicine"),
        "qualification": str(payload.get("qualification") or ""),
        "license_number": str(payload.get("license_number") or ""),
        "experience": str(payload.get("experience") or payload.get("experience_years") or "5 years"),
        "profile_photo": str(payload.get("profile_photo") or doctor_name[:2].upper()),
        "consultation_fee": payload.get("consultation_fee") if payload.get("consultation_fee") is not None else 800,
        "status": str(payload.get("status") or "Available"),
        "availability": str(payload.get("availability") or "Available today"),
        "rating": float(payload.get("rating") if payload.get("rating") is not None else 4.8),
        "clinic_id": clinic_id,
    }

    store = app.state.doctor_store
    existing = next((entry for entry in store if entry.get("id") == doctor_id), None)
    if existing:
        existing.update(doctor_record)
    else:
        store.append(doctor_record)

    return _doctor_response(doctor_record)


@app.get("/api/doctors/{doctor_id}")
def get_doctor(
    doctor_id: str,
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
) -> dict[str, object]:
    for doctor in app.state.doctor_store:
        if str(doctor.get("id")) == doctor_id:
            if user.get("clinic_id") and str(doctor.get("clinic_id")) != str(user["clinic_id"]):
                raise HTTPException(status_code=403, detail="This doctor does not belong to your clinic")
            return _doctor_response(doctor)
    raise HTTPException(status_code=404, detail="Doctor not found")


@app.put("/api/doctors/{doctor_id}")
def update_doctor(
    doctor_id: str,
    payload: dict[str, object],
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN")),
) -> dict[str, object]:
    clinic_id = str(user["clinic_id"])
    for doctor in app.state.doctor_store:
        if str(doctor.get("id")) == doctor_id:
            if str(doctor.get("clinic_id")) != clinic_id:
                raise HTTPException(status_code=403, detail="This doctor does not belong to your clinic")
            for key, value in payload.items():
                if value is None:
                    continue
                if key == "name":
                    doctor[key] = str(value)
                elif key == "specialization" or key == "specialty":
                    doctor["specialization"] = str(value)
                elif key == "consultation_fee":
                    doctor["consultation_fee"] = Decimal(str(value))
                elif key == "rating":
                    doctor["rating"] = float(value)
                else:
                    doctor[key] = value
            return _doctor_response(doctor)
    raise HTTPException(status_code=404, detail="Doctor not found")


@app.delete("/api/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: str,
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN")),
) -> dict[str, str]:
    clinic_id = str(user["clinic_id"])
    for index, doctor in enumerate(app.state.doctor_store):
        if str(doctor.get("id")) == doctor_id:
            if str(doctor.get("clinic_id")) != clinic_id:
                raise HTTPException(status_code=403, detail="This doctor does not belong to your clinic")
            del app.state.doctor_store[index]
            return {"message": "Doctor deleted successfully"}
    raise HTTPException(status_code=404, detail="Doctor not found")


@app.post("/api/availability", status_code=status.HTTP_201_CREATED)
def create_availability(
    schedule: AvailabilityRequest,
    user: dict[str, str] = Depends(require_clinic_context("DOCTOR")),
) -> dict[str, str]:
    ensure_same_clinic(user, schedule.clinic_id, field_name="schedule.clinic_id")
    with psycopg.connect(DATABASE_URL) as connection:
        doctor = connection.execute("SELECT id, clinic_id FROM doctors WHERE user_id = %s", (user["id"],)).fetchone()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        if user.get("clinic_id") and str(user["clinic_id"]) != str(doctor[1]):
            raise HTTPException(status_code=403, detail="This doctor does not belong to the active clinic")
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
    user: dict[str, str] = Depends(require_clinic_context("DOCTOR", "CLINIC_ADMIN")),
) -> dict[str, str]:
    ensure_same_clinic(user, slot.clinic_id, field_name="slot.clinic_id")
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
def available_slots(
    doctor_id: UUID,
    slot_date: date,
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
) -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        doctor = connection.execute("SELECT clinic_id FROM doctors WHERE id = %s", (str(doctor_id),)).fetchone()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        ensure_same_clinic(user, doctor[0], field_name="doctor.clinic_id")
        records = connection.execute(
            """SELECT id, clinic_id, start_time, end_time FROM appointment_slots
               WHERE doctor_id = %s AND clinic_id = %s AND slot_date = %s AND status = 'AVAILABLE' ORDER BY start_time""",
            (doctor_id, str(user["clinic_id"]), slot_date),
        ).fetchall()
    return [{"id": str(row[0]), "clinic_id": str(row[1]), "start_time": str(row[2]), "end_time": str(row[3])} for row in records]


@app.post("/api/appointments", status_code=status.HTTP_201_CREATED)
def book_appointment(
    booking: BookingRequest,
    user: dict[str, str] = Depends(require_clinic_context("PATIENT")),
) -> dict[str, str]:
    with psycopg.connect(DATABASE_URL) as connection:
        patient = connection.execute("SELECT id, clinic_id FROM patients WHERE user_id = %s", (user["id"],)).fetchone()
        slot = connection.execute(
            """SELECT doctor_id, clinic_id, slot_date, start_time, end_time FROM appointment_slots
               WHERE id = %s AND status = 'AVAILABLE' FOR UPDATE""",
            (booking.slot_id,),
        ).fetchone()
        if not patient or not slot:
            raise HTTPException(status_code=409, detail="That appointment slot is no longer available")
        ensure_same_clinic(user, patient[1], field_name="patient.clinic_id")
        if str(patient[1]) != str(slot[1]):
            raise HTTPException(
                status_code=400,
                detail="This patient can only be assigned to a doctor from the same clinic.",
            )

        validate_same_clinic_patient_doctor(patient[0], slot[0], connection)
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
    user: dict[str, str] = Depends(require_clinic_context("PATIENT", "CLINIC_ADMIN")),
) -> dict[str, str]:
    with psycopg.connect(DATABASE_URL) as connection:
        try:
            appointment = connection.execute(
                "SELECT clinic_id FROM appointments WHERE id = %s",
                (str(payment.appointment_id),),
            ).fetchone()
            if not appointment:
                raise HTTPException(status_code=404, detail="Appointment not found")
            ensure_same_clinic(user, appointment[0], field_name="appointment.clinic_id")

            record = connection.execute(
                """INSERT INTO payments (appointment_id, amount, transaction_reference)
                   VALUES (%s, %s, %s) RETURNING id, status""",
                (payment.appointment_id, payment.amount, payment.transaction_reference),
            ).fetchone()
            connection.commit()
        except psycopg.errors.UniqueViolation as error:
            raise HTTPException(status_code=409, detail="A payment already exists for this appointment") from error
    return {"id": str(record[0]), "status": record[1]}


@app.get("/api/invoices")
def list_invoices(
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN", "DOCTOR", "PATIENT")),
) -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        query = """SELECT invoices.id, invoices.invoice_number, COALESCE(patients.name, 'Walk-in patient'), invoices.issue_date, invoices.total, invoices.status, invoices.payment_method FROM invoices LEFT JOIN patients ON patients.id = invoices.patient_id WHERE invoices.clinic_id = %s"""
        params: list[object] = [user["clinic_id"]]
        if user["role"] == "PATIENT":
            patient = connection.execute("SELECT id FROM patients WHERE user_id = %s AND clinic_id = %s", (user["id"], user["clinic_id"])).fetchone()
            if not patient:
                return []
            query += " AND invoices.patient_id = %s"; params.append(patient[0])
        rows = connection.execute(query + " ORDER BY invoices.issue_date DESC", tuple(params)).fetchall()
    return [{"id": str(row[0]), "invoice_number": row[1], "patient": row[2], "issue_date": str(row[3]), "total": row[4], "status": row[5], "payment_method": row[6]} for row in rows]


@app.post("/api/invoices", status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice: InvoiceCreateRequest,
    user: dict[str, str] = Depends(require_clinic_context("CLINIC_ADMIN")),
) -> dict[str, object]:
    if invoice.status not in {"UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"}:
        raise HTTPException(status_code=400, detail="Unsupported invoice status")
    if invoice.subtotal < 0 or invoice.discount < 0 or invoice.tax < 0:
        raise HTTPException(status_code=400, detail="Invoice amounts cannot be negative")
    total = invoice.subtotal - invoice.discount + invoice.tax
    if total < 0:
        raise HTTPException(status_code=400, detail="Invoice total cannot be negative")
    with psycopg.connect(DATABASE_URL) as connection:
        if invoice.patient_id:
            patient = connection.execute("SELECT clinic_id FROM patients WHERE id = %s", (invoice.patient_id,)).fetchone()
            if not patient:
                raise HTTPException(status_code=404, detail="Patient not found")
            ensure_same_clinic(user, patient[0], field_name="patient.clinic_id")
        number = f"INV-{uuid4().hex[:8].upper()}"
        record = connection.execute("""INSERT INTO invoices (clinic_id, patient_id, appointment_id, invoice_number, subtotal, discount, tax, total, status, payment_method) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""", (user["clinic_id"], invoice.patient_id, invoice.appointment_id, number, invoice.subtotal, invoice.discount, invoice.tax, total, invoice.status, invoice.payment_method)).fetchone()
        connection.commit()
    return {"id": str(record[0]), "invoice_number": number, "total": total, "status": invoice.status}


@app.get("/api/notifications")
def notifications(user: dict[str, str] = Depends(current_user)) -> list[dict[str, object]]:
    with psycopg.connect(DATABASE_URL) as connection:
        records = connection.execute(
            """SELECT id, title, message, type, is_read, created_at FROM notifications
               WHERE user_id = %s ORDER BY created_at DESC""",
            (user["id"],),
        ).fetchall()
    return [{"id": str(row[0]), "title": row[1], "message": row[2], "type": row[3], "is_read": row[4], "created_at": row[5]} for row in records]