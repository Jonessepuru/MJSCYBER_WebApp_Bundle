# MJSCYBER Security School — Web Application
## Complete Source Code Bundle

**Client:** MJSCYBER PTY LTD (Reg 2022/201980/07) — Bochum, Limpopo
**Team:** Jones Sepuru & Khumela Sendelani
**Module:** WIL – Work Integrated Learning 3A (XISD5319)
**Version:** 1.0 — April 2026

---

## 📦 What's in this bundle

```
MJSCYBER_WebApp_Bundle/
├── README.md                       <-- this file
├── PROJECT_TASKS.md                <-- full WBS (20 tasks across 5 phases)
├── backend/                        <-- Python FastAPI + MongoDB
│   ├── server.py                   <-- All routes, auth, Stripe, PDF, seed
│   ├── requirements.txt
│   └── .env.example
├── frontend/                       <-- React 19 + Tailwind
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── contexts/AuthContext.js
│   │   ├── lib/api.js
│   │   ├── lib/errorFormat.js
│   │   ├── lib/utils.js
│   │   ├── hooks/use-toast.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── WhatsAppFab.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── About.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Courses.jsx
│   │       ├── Verify.jsx
│   │       ├── StudentDashboard.jsx
│   │       └── AdminDashboard.jsx
│   ├── public/
│   │   ├── index.html
│   │   └── img/ (hero, guard, team, certificate photos)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── craco.config.js
│   ├── jsconfig.json
│   └── .env.example
└── docs/
    ├── Project_Plan.docx           <-- the WIL Task 1 Project Plan (100-mark rubric)
    └── Test_Credentials.md
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 6+
- (Optional) Stripe account in TEST mode

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Linux / macOS
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
The server auto-seeds on first boot: 1 admin, 3 students, 6 courses, 2 certificates, 1 VIP and 1 site-security request.

### 2. Frontend
```bash
cd frontend
yarn install                  # or npm install
cp .env.example .env
# Edit .env — set REACT_APP_BACKEND_URL=http://localhost:8001
yarn start                    # or npm start
```
App opens at http://localhost:3000.

---

## 🔑 Demo credentials

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@mjscyber.co.za       | Admin@123   |
| Student | thabo@student.co.za        | Student@123 |
| Student | nandi@student.co.za        | Student@123 |
| Student | sipho@student.co.za        | Student@123 |

---

## 🧭 Feature map

- **Landing** (`/`) — hero, features, student journey, CTA
- **About** (`/about`) — mission, vision, values, 2022→2026 timeline, services, contact
- **Courses** (`/courses`) — PSIRA Grades E–A + Armed Response; student-only Enrol button
- **Verify** (`/verify/:serial`) — public certificate verification (no login)
- **Login / Register** (`/login`, `/register`)
- **Student Dashboard** (`/dashboard`) — enrolments, certificates (download PDF), service requests
- **Admin Dashboard** (`/admin`) — Overview · Enrolments · Students · Courses · Certificates · VIP · Site
- **Floating WhatsApp FAB** — bottom-right, prefilled message to +27 82 426 8567

### Integrations
- **JWT auth** (httpOnly cookies, bcrypt, brute-force lockout)
- **Stripe Checkout** (ZAR, server-side amount, webhook at `/api/webhook/stripe`)
- **PDF Certificates** (ReportLab + QR code, A4 landscape, branded template)

---

## 🗂 API endpoints (prefix `/api`)

```
POST   /auth/register        POST   /auth/login          POST  /auth/logout
GET    /auth/me              POST   /auth/refresh

GET    /courses              (public)
GET    /courses/all          (admin)
POST   /courses              (admin)
PUT    /courses/{id}         (admin)
DELETE /courses/{id}         (admin soft-archive)

POST   /enrolments           (student)
GET    /enrolments/mine      (student)
GET    /enrolments           (admin)
PATCH  /enrolments/{id}/approve   (admin)
PATCH  /enrolments/{id}/grade     (admin)

POST   /certificates/issue/{enrolment_id}  (admin)
GET    /certificates/mine                  (student)
GET    /certificates                       (admin)
GET    /certificates/{id}/pdf              (owner or admin)
GET    /verify/{serial}                    (public)

POST   /vip-requests         GET  /vip-requests         PATCH /vip-requests/{id}
POST   /site-security        GET  /site-security        PATCH /site-security/{id}

POST   /payments/checkout            (student)
GET    /payments/status/{session_id} (student)
POST   /webhook/stripe               (public, Stripe-only)

GET    /admin/stats          GET  /admin/students
```

---

## 🔒 Security notes
- Passwords bcrypt-hashed; never stored in plain.
- JWT tokens are **httpOnly cookies** (not accessible to JavaScript).
- 5 failed logins → 15-minute lockout per `IP:email`.
- Stripe amount is derived **server-side** from the course document — the frontend cannot tamper with the price.
- CORS locked to `FRONTEND_URL` in production.

---

## 📝 License & ownership
© 2026 MJSCYBER PTY LTD. All rights reserved. Source code delivered as part of WIL 3A academic project.
