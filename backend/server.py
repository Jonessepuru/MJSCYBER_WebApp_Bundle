"""
MJSCYBER Security School – Backend API
FastAPI + MongoDB + JWT auth
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, status
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr, Field

# PDF + QR
import io
import qrcode
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as pdf_canvas
from reportlab.lib.utils import ImageReader

# Stripe
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest,
)

# ---------------------------------------------------------------------------
# Config / DB
# ---------------------------------------------------------------------------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@mjscyber.co.za")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123")

client = AsyncIOMotorClient(MONGO_URL)
db: AsyncIOMotorDatabase = client[DB_NAME]

app = FastAPI(title="MJSCYBER Security School API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("mjscyber")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role, "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id, "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def set_auth_cookies(resp: Response, access: str, refresh: str) -> None:
    resp.set_cookie("access_token",  access,  httponly=True, samesite="lax",
                    secure=False, max_age=60*60*12, path="/")
    resp.set_cookie("refresh_token", refresh, httponly=True, samesite="lax",
                    secure=False, max_age=60*60*24*7, path="/")

def sanitize_user(u: dict) -> dict:
    if not u:
        return u
    u = dict(u)
    if "_id" in u:
        u["id"] = str(u["_id"]); u.pop("_id")
    u.pop("password_hash", None)
    return u


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        hdr = request.headers.get("Authorization", "")
        if hdr.startswith("Bearer "):
            token = hdr[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return sanitize_user(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    phone: Optional[str] = None
    id_number: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class CourseIn(BaseModel):
    title: str
    code: str
    grade: str
    description: str
    duration_days: int = Field(ge=1)
    price_zar: float = Field(ge=0)
    active: bool = True

class EnrolmentIn(BaseModel):
    course_id: str

class GradeIn(BaseModel):
    theory_mark: float = Field(ge=0, le=100)
    practical_mark: float = Field(ge=0, le=100)
    comments: Optional[str] = ""

class VipRequestIn(BaseModel):
    client_name: str
    contact: str
    start_date: str
    end_date: str
    location: str
    details: str
    guards_needed: int = Field(ge=1, le=50)

class SiteSecurityIn(BaseModel):
    site_name: str
    location: str
    start_date: str
    end_date: str
    guards_needed: int = Field(ge=1, le=100)
    shift_type: Literal["day", "night", "24-7"] = "day"
    details: Optional[str] = ""

class StatusUpdateIn(BaseModel):
    status: str
    note: Optional[str] = ""


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "phone": payload.phone or "",
        "id_number": payload.id_number or "",
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    access = create_access_token(uid, email, "student")
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    doc["_id"] = res.inserted_id
    return sanitize_user(doc)


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response, request: Request):
    email = payload.email.lower()
    identifier = f"{request.client.host if request.client else 'unk'}:{email}"

    # brute-force check
    lock = await db.login_attempts.find_one({"identifier": identifier})
    if lock and lock.get("count", 0) >= 5:
        locked_until = lock.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1},
             "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    uid = str(user["_id"])
    access = create_access_token(uid, email, user["role"])
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return sanitize_user(user)


@api.post("/auth/logout")
async def logout(response: Response, _: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    rt = request.cookies.get("refresh_token")
    if not rt:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(rt, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"], user["role"])
        response.set_cookie("access_token", access, httponly=True, samesite="lax",
                            secure=False, max_age=60*60*12, path="/")
        return {"ok": True}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------------------------------------------------------------------------
# Courses
# ---------------------------------------------------------------------------
async def _course_doc_to_public(c: dict) -> dict:
    c = dict(c); c["id"] = str(c["_id"]); c.pop("_id"); return c

@api.get("/courses")
async def list_courses():
    items = await db.courses.find({"active": True}).to_list(500)
    return [await _course_doc_to_public(c) for c in items]

@api.get("/courses/all")
async def list_all_courses(_: dict = Depends(require_admin)):
    items = await db.courses.find({}).to_list(500)
    return [await _course_doc_to_public(c) for c in items]

@api.post("/courses")
async def create_course(payload: CourseIn, _: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    try:
        res = await db.courses.insert_one(doc); doc["_id"] = res.inserted_id
    except Exception as e:
        if "duplicate key" in str(e).lower():
            raise HTTPException(409, f"A course with code '{payload.code}' already exists")
        raise HTTPException(500, "Failed to create course")
    return await _course_doc_to_public(doc)

@api.put("/courses/{course_id}")
async def update_course(course_id: str, payload: CourseIn, _: dict = Depends(require_admin)):
    await db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": payload.model_dump()})
    c = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not c: raise HTTPException(404, "Course not found")
    return await _course_doc_to_public(c)

@api.delete("/courses/{course_id}")
async def delete_course(course_id: str, _: dict = Depends(require_admin)):
    await db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": {"active": False}})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Enrolments
# ---------------------------------------------------------------------------
async def _enrolment_expand(e: dict) -> dict:
    e = dict(e); e["id"] = str(e["_id"]); e.pop("_id")
    course = await db.courses.find_one({"_id": ObjectId(e["course_id"])})
    user = await db.users.find_one({"_id": ObjectId(e["student_id"])})
    e["course"] = await _course_doc_to_public(course) if course else None
    e["student"] = {"id": str(user["_id"]), "name": user["name"], "email": user["email"]} if user else None
    return e

@api.post("/enrolments")
async def create_enrolment(payload: EnrolmentIn, user: dict = Depends(get_current_user)):
    if user["role"] != "student":
        raise HTTPException(403, "Only students can enrol")
    course = await db.courses.find_one({"_id": ObjectId(payload.course_id), "active": True})
    if not course: raise HTTPException(404, "Course not found")
    existing = await db.enrolments.find_one({
        "student_id": user["id"], "course_id": payload.course_id,
        "status": {"$in": ["pending", "active"]}
    })
    if existing: raise HTTPException(409, "Already enrolled or pending")
    doc = {
        "student_id": user["id"],
        "course_id": payload.course_id,
        "status": "pending",
        "payment_status": "pending",
        "theory_mark": None,
        "practical_mark": None,
        "overall_mark": None,
        "comments": "",
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.enrolments.insert_one(doc); doc["_id"] = res.inserted_id
    return await _enrolment_expand(doc)

@api.get("/enrolments/mine")
async def my_enrolments(user: dict = Depends(get_current_user)):
    items = await db.enrolments.find({"student_id": user["id"]}).to_list(500)
    return [await _enrolment_expand(e) for e in items]

@api.get("/enrolments")
async def all_enrolments(_: dict = Depends(require_admin)):
    items = await db.enrolments.find({}).sort("enrolled_at", -1).to_list(1000)
    return [await _enrolment_expand(e) for e in items]

@api.patch("/enrolments/{enrolment_id}/approve")
async def approve_enrolment(enrolment_id: str, _: dict = Depends(require_admin)):
    await db.enrolments.update_one(
        {"_id": ObjectId(enrolment_id)},
        {"$set": {"status": "active", "payment_status": "paid"}}
    )
    e = await db.enrolments.find_one({"_id": ObjectId(enrolment_id)})
    if not e: raise HTTPException(404, "Enrolment not found")
    return await _enrolment_expand(e)

@api.patch("/enrolments/{enrolment_id}/grade")
async def grade_enrolment(enrolment_id: str, payload: GradeIn, _: dict = Depends(require_admin)):
    overall = round((payload.theory_mark + payload.practical_mark) / 2, 2)
    status_val = "completed" if overall >= 50 else "failed"
    await db.enrolments.update_one(
        {"_id": ObjectId(enrolment_id)},
        {"$set": {
            "theory_mark": payload.theory_mark,
            "practical_mark": payload.practical_mark,
            "overall_mark": overall,
            "comments": payload.comments,
            "status": status_val,
            "graded_at": datetime.now(timezone.utc).isoformat(),
        }}
    )
    e = await db.enrolments.find_one({"_id": ObjectId(enrolment_id)})
    return await _enrolment_expand(e)


# ---------------------------------------------------------------------------
# Certificates
# ---------------------------------------------------------------------------
def _make_serial() -> str:
    return "MJS-" + datetime.now().strftime("%Y") + "-" + secrets.token_hex(4).upper()

async def _cert_expand(c: dict) -> dict:
    c = dict(c); c["id"] = str(c["_id"]); c.pop("_id"); return c

@api.post("/certificates/issue/{enrolment_id}")
async def issue_certificate(enrolment_id: str, _: dict = Depends(require_admin)):
    enrol = await db.enrolments.find_one({"_id": ObjectId(enrolment_id)})
    if not enrol: raise HTTPException(404, "Enrolment not found")
    if enrol.get("status") != "completed":
        raise HTTPException(400, "Enrolment not completed (must pass with >=50%)")
    existing = await db.certificates.find_one({"enrolment_id": enrolment_id})
    if existing: return await _cert_expand(existing)

    course = await db.courses.find_one({"_id": ObjectId(enrol["course_id"])})
    user = await db.users.find_one({"_id": ObjectId(enrol["student_id"])})
    doc = {
        "serial": _make_serial(),
        "enrolment_id": enrolment_id,
        "student_id": enrol["student_id"],
        "course_id": enrol["course_id"],
        "student_name": user["name"] if user else "Unknown",
        "student_email": user["email"] if user else "",
        "student_id_number": user.get("id_number", "") if user else "",
        "course_title": course["title"] if course else "",
        "course_code": course["code"] if course else "",
        "course_grade": course["grade"] if course else "",
        "overall_mark": enrol.get("overall_mark"),
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "issuer": "MJSCYBER PTY LTD (Reg 2022/201980/07)",
        "valid": True,
    }
    res = await db.certificates.insert_one(doc); doc["_id"] = res.inserted_id
    return await _cert_expand(doc)

@api.get("/certificates/mine")
async def my_certificates(user: dict = Depends(get_current_user)):
    items = await db.certificates.find({"student_id": user["id"]}).to_list(500)
    return [await _cert_expand(c) for c in items]

@api.get("/certificates")
async def all_certificates(_: dict = Depends(require_admin)):
    items = await db.certificates.find({}).sort("issued_at", -1).to_list(500)
    return [await _cert_expand(c) for c in items]

@api.get("/verify/{serial}")
async def verify_certificate(serial: str):
    """Public certificate verification — no auth."""
    c = await db.certificates.find_one({"serial": serial.upper().strip()})
    if not c:
        return {"valid": False, "message": "No certificate found for this serial."}
    return {
        "valid": bool(c.get("valid", True)),
        "serial": c["serial"],
        "student_name": c["student_name"],
        "course_title": c["course_title"],
        "course_code": c["course_code"],
        "course_grade": c["course_grade"],
        "overall_mark": c.get("overall_mark"),
        "issued_at": c["issued_at"],
        "issuer": c["issuer"],
    }


# ---------------------------------------------------------------------------
# VIP requests & Site security
# ---------------------------------------------------------------------------
def _to_public(d: dict) -> dict:
    d = dict(d); d["id"] = str(d["_id"]); d.pop("_id"); return d

@api.post("/vip-requests")
async def create_vip(payload: VipRequestIn, user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc.update({
        "created_by": user["id"],
        "created_by_email": user["email"],
        "status": "pending",
        "assigned_guards": 0,
        "note": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    res = await db.vip_requests.insert_one(doc); doc["_id"] = res.inserted_id
    return _to_public(doc)

@api.get("/vip-requests")
async def list_vip(user: dict = Depends(get_current_user)):
    q = {} if user["role"] == "admin" else {"created_by": user["id"]}
    items = await db.vip_requests.find(q).sort("created_at", -1).to_list(500)
    return [_to_public(i) for i in items]

@api.patch("/vip-requests/{req_id}")
async def update_vip(req_id: str, payload: StatusUpdateIn, _: dict = Depends(require_admin)):
    await db.vip_requests.update_one({"_id": ObjectId(req_id)},
                                     {"$set": {"status": payload.status, "note": payload.note}})
    d = await db.vip_requests.find_one({"_id": ObjectId(req_id)})
    return _to_public(d)

@api.post("/site-security")
async def create_site(payload: SiteSecurityIn, user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc.update({
        "created_by": user["id"],
        "created_by_email": user["email"],
        "status": "pending",
        "assigned_guards": 0,
        "note": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    res = await db.site_security.insert_one(doc); doc["_id"] = res.inserted_id
    return _to_public(doc)

@api.get("/site-security")
async def list_site(user: dict = Depends(get_current_user)):
    q = {} if user["role"] == "admin" else {"created_by": user["id"]}
    items = await db.site_security.find(q).sort("created_at", -1).to_list(500)
    return [_to_public(i) for i in items]

@api.patch("/site-security/{req_id}")
async def update_site(req_id: str, payload: StatusUpdateIn, _: dict = Depends(require_admin)):
    await db.site_security.update_one({"_id": ObjectId(req_id)},
                                      {"$set": {"status": payload.status, "note": payload.note}})
    d = await db.site_security.find_one({"_id": ObjectId(req_id)})
    return _to_public(d)


# ---------------------------------------------------------------------------
# Stripe payments
# ---------------------------------------------------------------------------
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")


class CheckoutIn(BaseModel):
    enrolment_id: str
    origin_url: str


@api.post("/payments/checkout")
async def create_checkout(payload: CheckoutIn, request: Request, user: dict = Depends(get_current_user)):
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe is not configured on the server")

    enrol = await db.enrolments.find_one({"_id": ObjectId(payload.enrolment_id)})
    if not enrol:
        raise HTTPException(404, "Enrolment not found")
    if enrol["student_id"] != user["id"]:
        raise HTTPException(403, "Not your enrolment")
    if enrol.get("payment_status") == "paid":
        raise HTTPException(400, "Already paid")

    course = await db.courses.find_one({"_id": ObjectId(enrol["course_id"])})
    if not course:
        raise HTTPException(404, "Course not found")

    # Server-side amount; never trust frontend
    amount = float(course["price_zar"])
    currency = "zar"

    host = str(request.base_url).rstrip("/")
    webhook_url = f"{host}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/dashboard?payment=cancel"

    req = CheckoutSessionRequest(
        amount=amount,
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "enrolment_id": payload.enrolment_id,
            "student_id": user["id"],
            "course_id": enrol["course_id"],
        },
    )
    try:
        session = await stripe.create_checkout_session(req)
    except Exception as e:
        log.error("Stripe create session failed: %s", e)
        raise HTTPException(status_code=502, detail="Payment provider unavailable. Please try again shortly.")

    # Record pending transaction
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "enrolment_id": payload.enrolment_id,
        "student_id": user["id"],
        "course_id": enrol["course_id"],
        "amount": amount,
        "currency": currency,
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.session_id}


@api.get("/payments/status/{session_id}")
async def checkout_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe is not configured")

    txn = await db.payment_transactions.find_one({"session_id": session_id})
    if not txn:
        raise HTTPException(404, "Transaction not found")
    if txn["student_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")

    # If already finalised, return cached state
    if txn.get("payment_status") == "paid":
        return {"payment_status": "paid", "status": txn.get("status", "complete")}

    host = str(request.base_url).rstrip("/")
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host}/api/webhook/stripe")
    try:
        live = await stripe.get_checkout_status(session_id)
    except Exception as e:
        # Transient Stripe failure — return cached pending state so the frontend can keep polling
        log.warning("Stripe status fetch failed for %s: %s", session_id, e)
        return {
            "payment_status": txn.get("payment_status", "pending"),
            "status": txn.get("status", "pending"),
            "note": "Payment provider temporarily unreachable; please retry shortly.",
        }

    update = {"status": live.status, "payment_status": live.payment_status,
              "amount_total": live.amount_total, "checked_at": datetime.now(timezone.utc).isoformat()}
    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update})

    # Idempotently mark enrolment as paid + active
    if live.payment_status == "paid" and txn.get("payment_status") != "paid":
        await db.enrolments.update_one(
            {"_id": ObjectId(txn["enrolment_id"])},
            {"$set": {"payment_status": "paid", "status": "active"}}
        )

    return {"payment_status": live.payment_status, "status": live.status,
            "amount_total": live.amount_total, "currency": live.currency}


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe not configured")
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    host = str(request.base_url).rstrip("/")
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host}/api/webhook/stripe")
    try:
        evt = await stripe.handle_webhook(body, sig)
    except Exception as e:
        log.error("Stripe webhook error: %s", e)
        return {"received": False}

    if evt.payment_status == "paid" and evt.session_id:
        txn = await db.payment_transactions.find_one({"session_id": evt.session_id})
        if txn and txn.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": evt.session_id},
                {"$set": {"payment_status": "paid", "status": "complete",
                          "event_type": evt.event_type, "webhook_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.enrolments.update_one(
                {"_id": ObjectId(txn["enrolment_id"])},
                {"$set": {"payment_status": "paid", "status": "active"}}
            )
    return {"received": True}


# ---------------------------------------------------------------------------
# Certificate PDF generation (with QR code)
# ---------------------------------------------------------------------------
def _build_certificate_pdf(cert: dict, verify_url: str) -> bytes:
    buf = io.BytesIO()
    page_w, page_h = landscape(A4)
    c = pdf_canvas.Canvas(buf, pagesize=landscape(A4))

    NAVY = HexColor("#0B3D91")
    RED = HexColor("#C0392B")
    GOLD = HexColor("#D4A437")
    INK = HexColor("#1A1A1A")
    MUTED = HexColor("#666666")

    # Outer frame
    c.setStrokeColor(NAVY); c.setLineWidth(4)
    c.rect(15*mm, 15*mm, page_w - 30*mm, page_h - 30*mm)
    c.setStrokeColor(GOLD); c.setLineWidth(1.4)
    c.rect(20*mm, 20*mm, page_w - 40*mm, page_h - 40*mm)

    # Header band
    c.setFillColor(NAVY)
    c.rect(20*mm, page_h - 45*mm, page_w - 40*mm, 25*mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 22)
    c.drawString(30*mm, page_h - 33*mm, "MJSCYBER")
    c.setFont("Helvetica", 11)
    c.drawString(30*mm, page_h - 40*mm, "SECURITY SCHOOL  ·  CIPC 2022/201980/07  ·  BOCHUM, LIMPOPO")
    c.setFont("Helvetica-Bold", 16)
    c.drawRightString(page_w - 30*mm, page_h - 35*mm, "CERTIFICATE OF COMPETENCY")

    # Body text
    c.setFillColor(INK)
    c.setFont("Helvetica", 13)
    c.drawCentredString(page_w/2, page_h - 65*mm, "This is to certify that")

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 34)
    c.drawCentredString(page_w/2, page_h - 82*mm, cert["student_name"].upper())

    c.setFillColor(INK); c.setFont("Helvetica", 13)
    c.drawCentredString(page_w/2, page_h - 95*mm, "has successfully completed the training programme")

    c.setFillColor(RED); c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(page_w/2, page_h - 110*mm, f"{cert['course_title']}  ({cert['course_code']})")

    c.setFillColor(INK); c.setFont("Helvetica", 12)
    if cert.get("overall_mark") is not None:
        c.drawCentredString(page_w/2, page_h - 122*mm,
                            f"Grade {cert['course_grade']}   ·   Overall Mark: {cert['overall_mark']}%")
    else:
        c.drawCentredString(page_w/2, page_h - 122*mm, f"Grade {cert['course_grade']}")

    # Signatures
    c.setStrokeColor(MUTED); c.setLineWidth(0.6)
    c.line(40*mm, 45*mm, 95*mm, 45*mm)
    c.line(page_w - 95*mm, 45*mm, page_w - 40*mm, 45*mm)
    c.setFillColor(MUTED); c.setFont("Helvetica", 10)
    c.drawString(40*mm, 40*mm, "Director")
    c.drawString(40*mm, 36*mm, "MJSCYBER PTY LTD")
    c.drawRightString(page_w - 40*mm, 40*mm, "Date of Issue")
    issued_str = cert["issued_at"][:10] if isinstance(cert["issued_at"], str) else str(cert["issued_at"])[:10]
    c.drawRightString(page_w - 40*mm, 36*mm, issued_str)

    # Serial + QR
    qr_img = qrcode.make(verify_url)
    qr_buf = io.BytesIO(); qr_img.save(qr_buf, format="PNG"); qr_buf.seek(0)
    c.drawImage(ImageReader(qr_buf), page_w/2 - 17*mm, 30*mm, width=34*mm, height=34*mm)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(page_w/2, 28*mm, f"Serial: {cert['serial']}")
    c.setFont("Helvetica", 8); c.setFillColor(MUTED)
    c.drawCentredString(page_w/2, 23*mm, "Scan to verify authenticity at mjscyber.co.za/verify")

    c.showPage(); c.save()
    return buf.getvalue()


@api.get("/certificates/{cert_id}/pdf")
async def certificate_pdf(cert_id: str, user: dict = Depends(get_current_user)):
    cert = await db.certificates.find_one({"_id": ObjectId(cert_id)})
    if not cert:
        raise HTTPException(404, "Certificate not found")
    # Students can only download their own certificates; admin can download any
    if user["role"] != "admin" and cert.get("student_id") != user["id"]:
        raise HTTPException(403, "Forbidden")

    frontend = os.environ.get("FRONTEND_URL", "").rstrip("/") or "https://mjscyber.co.za"
    verify_url = f"{frontend}/verify/{cert['serial']}"

    pdf_bytes = _build_certificate_pdf(cert, verify_url)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="MJSCYBER_Certificate_{cert["serial"]}.pdf"'}
    )


# ---------------------------------------------------------------------------
# Admin stats
# ---------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    students = await db.users.count_documents({"role": "student"})
    courses = await db.courses.count_documents({"active": True})
    enrolments_pending = await db.enrolments.count_documents({"status": "pending"})
    enrolments_active = await db.enrolments.count_documents({"status": "active"})
    enrolments_completed = await db.enrolments.count_documents({"status": "completed"})
    certs = await db.certificates.count_documents({})
    vip_pending = await db.vip_requests.count_documents({"status": "pending"})
    site_pending = await db.site_security.count_documents({"status": "pending"})

    # Revenue = paid enrolments price sum
    paid = await db.enrolments.find({"payment_status": "paid"}).to_list(2000)
    revenue = 0.0
    for e in paid:
        c = await db.courses.find_one({"_id": ObjectId(e["course_id"])})
        if c: revenue += float(c.get("price_zar", 0))

    return {
        "students": students,
        "courses": courses,
        "enrolments_pending": enrolments_pending,
        "enrolments_active": enrolments_active,
        "enrolments_completed": enrolments_completed,
        "certificates": certs,
        "vip_pending": vip_pending,
        "site_pending": site_pending,
        "revenue_zar": round(revenue, 2),
    }


@api.get("/admin/students")
async def admin_students(_: dict = Depends(require_admin)):
    items = await db.users.find({"role": "student"}).sort("created_at", -1).to_list(1000)
    return [sanitize_user(u) for u in items]


@api.get("/")
async def root():
    return {"message": "MJSCYBER API online", "version": "1.0.0"}


app.include_router(api)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
frontend_url = os.environ.get("FRONTEND_URL", "")
allowed_origins = [frontend_url, "http://localhost:3000"] if frontend_url else ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup: indexes, admin seed, demo data
# ---------------------------------------------------------------------------
DEMO_COURSES = [
    {"title": "PSIRA Grade E",   "code": "PSE-E",  "grade": "E", "description": "Entry-level security officer training covering basics of patrolling, access control and report writing.", "duration_days": 5,  "price_zar": 1200},
    {"title": "PSIRA Grade D",   "code": "PSE-D",  "grade": "D", "description": "Intermediate security officer module: radio procedure, OHS, and emergency response.",                     "duration_days": 5,  "price_zar": 1400},
    {"title": "PSIRA Grade C",   "code": "PSE-C",  "grade": "C", "description": "Supervisor-level training covering incident command, briefings and evidence handling.",                   "duration_days": 7,  "price_zar": 1800},
    {"title": "PSIRA Grade B",   "code": "PSE-B",  "grade": "B", "description": "Site-manager training: guard deployment planning, rostering, and compliance.",                            "duration_days": 10, "price_zar": 2500},
    {"title": "PSIRA Grade A",   "code": "PSE-A",  "grade": "A", "description": "Senior management: contracts, HR, operational audits and client liaison.",                               "duration_days": 14, "price_zar": 3800},
    {"title": "Armed Response",  "code": "AR-01",  "grade": "SP","description": "Firearms competency, tactical driving, armed reaction protocols and legal framework.",                   "duration_days": 21, "price_zar": 6500},
]

async def ensure_indexes():
    await db.users.create_index("email", unique=True)
    await db.courses.create_index("code", unique=True)
    await db.certificates.create_index("serial", unique=True)
    await db.login_attempts.create_index("identifier")


async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "MJSCYBER Administrator",
            "role": "admin",
            "phone": "+27-00-000-0000",
            "id_number": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        log.info("Seeded admin user: %s", ADMIN_EMAIL)
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL},
                                  {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})


async def seed_courses():
    for c in DEMO_COURSES:
        existing = await db.courses.find_one({"code": c["code"]})
        if not existing:
            doc = dict(c); doc["active"] = True
            doc["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.courses.insert_one(doc)
    log.info("Seeded %d courses", len(DEMO_COURSES))


async def seed_demo_students():
    demo = [
        {"email": "thabo@student.co.za",   "name": "Thabo Mokoena",    "password": "Student@123", "id_number": "9001015800087", "phone": "+27-82-111-2222"},
        {"email": "nandi@student.co.za",   "name": "Nandi Dlamini",    "password": "Student@123", "id_number": "9203025400081", "phone": "+27-83-222-3333"},
        {"email": "sipho@student.co.za",   "name": "Sipho Ngobeni",    "password": "Student@123", "id_number": "8805105700080", "phone": "+27-84-333-4444"},
    ]
    for s in demo:
        if not await db.users.find_one({"email": s["email"]}):
            await db.users.insert_one({
                "email": s["email"],
                "password_hash": hash_password(s["password"]),
                "name": s["name"],
                "role": "student",
                "phone": s["phone"],
                "id_number": s["id_number"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
    log.info("Seeded demo students")


async def seed_demo_activity():
    """Seed 2 completed enrolments with issued certificates + 1 pending."""
    if await db.certificates.count_documents({}) >= 2:
        return
    thabo = await db.users.find_one({"email": "thabo@student.co.za"})
    nandi = await db.users.find_one({"email": "nandi@student.co.za"})
    sipho = await db.users.find_one({"email": "sipho@student.co.za"})
    grade_e = await db.courses.find_one({"code": "PSE-E"})
    armed = await db.courses.find_one({"code": "AR-01"})
    grade_c = await db.courses.find_one({"code": "PSE-C"})
    if not (thabo and nandi and sipho and grade_e and armed and grade_c):
        return

    async def _make_enrol(user, course, mark=None, completed=False, pending=False):
        exists = await db.enrolments.find_one({"student_id": str(user["_id"]), "course_id": str(course["_id"])})
        if exists: return exists
        doc = {
            "student_id": str(user["_id"]),
            "course_id": str(course["_id"]),
            "status": "pending" if pending else ("completed" if completed else "active"),
            "payment_status": "pending" if pending else "paid",
            "theory_mark": mark, "practical_mark": mark,
            "overall_mark": mark,
            "comments": "",
            "enrolled_at": datetime.now(timezone.utc).isoformat(),
        }
        if completed:
            doc["graded_at"] = datetime.now(timezone.utc).isoformat()
        res = await db.enrolments.insert_one(doc); doc["_id"] = res.inserted_id
        return doc

    e1 = await _make_enrol(thabo, grade_e, mark=82, completed=True)
    e2 = await _make_enrol(nandi, armed,   mark=76, completed=True)
    await _make_enrol(sipho, grade_c, pending=True)

    async def _make_cert(enrol, user, course):
        if await db.certificates.find_one({"enrolment_id": str(enrol["_id"])}): return
        doc = {
            "serial": _make_serial(),
            "enrolment_id": str(enrol["_id"]),
            "student_id": str(user["_id"]),
            "course_id": str(course["_id"]),
            "student_name": user["name"],
            "student_email": user["email"],
            "student_id_number": user.get("id_number", ""),
            "course_title": course["title"],
            "course_code": course["code"],
            "course_grade": course["grade"],
            "overall_mark": enrol.get("overall_mark"),
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "issuer": "MJSCYBER PTY LTD (Reg 2022/201980/07)",
            "valid": True,
        }
        await db.certificates.insert_one(doc)

    await _make_cert(e1, thabo, grade_e)
    await _make_cert(e2, nandi, armed)
    log.info("Seeded demo enrolments & certificates")


async def seed_demo_requests():
    if await db.vip_requests.count_documents({}) == 0:
        user = await db.users.find_one({"email": "thabo@student.co.za"})
        if user:
            await db.vip_requests.insert_one({
                "client_name": "Pretoria Diamonds Ltd",
                "contact": "+27-12-345-6789",
                "start_date": "2026-05-10",
                "end_date": "2026-05-12",
                "location": "Sandton, JHB",
                "details": "Executive transport & venue security for CEO visit.",
                "guards_needed": 4,
                "created_by": str(user["_id"]),
                "created_by_email": user["email"],
                "status": "pending",
                "assigned_guards": 0,
                "note": "",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
    if await db.site_security.count_documents({}) == 0:
        user = await db.users.find_one({"email": "nandi@student.co.za"})
        if user:
            await db.site_security.insert_one({
                "site_name": "Polokwane Heights Construction",
                "location": "Polokwane, LP",
                "start_date": "2026-05-01",
                "end_date": "2026-08-30",
                "guards_needed": 6,
                "shift_type": "24-7",
                "details": "Multi-storey residential build; equipment & perimeter protection.",
                "created_by": str(user["_id"]),
                "created_by_email": user["email"],
                "status": "pending",
                "assigned_guards": 0,
                "note": "",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })


@app.on_event("startup")
async def startup():
    await ensure_indexes()
    await seed_admin()
    await seed_courses()
    await seed_demo_students()
    await seed_demo_activity()
    await seed_demo_requests()
    log.info("MJSCYBER startup complete")


@app.on_event("shutdown")
async def shutdown():
    client.close()
