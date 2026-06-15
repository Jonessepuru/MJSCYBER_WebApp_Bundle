# MJSCYBER Security School — Full Project Task List
## Work Breakdown Structure (WBS) — 20 tasks · 5 phases · 70 working days

**Project:** MJSCYBER Security School Web App & Database
**Timeline:** 04 May 2026 → 05 August 2026 (≈14 weeks)
**Team:** Jones Sepuru (PM & Backend Lead) · Khumela Sendelani (Frontend Lead & Docs)

---

## 📋 Summary by phase

| Phase | Name                          | Duration | Tasks       |
|-------|-------------------------------|----------|-------------|
| 1     | Initiation                    | 10 d     | 1.1 – 1.3   |
| 2     | Analysis & Design             | 10 d     | 2.1 – 2.4   |
| 3     | Development                   | 30 d     | 3.1 – 3.7   |
| 4     | Testing                       | 10 d     | 4.1 – 4.3   |
| 5     | Deployment & Handover         | 10 d     | 5.1 – 5.3   |

---

## 🏁 Milestones

| ID | Milestone               | Target Date   | Deliverable                                       |
|----|-------------------------|---------------|---------------------------------------------------|
| M1 | Scope Sign-off          | 15 May 2026   | Approved Project Charter & Scope Statement        |
| M2 | Design Freeze           | 25 May 2026   | ERD, Wireframes, Technical Architecture Doc       |
| M3 | Development Complete    | 10 Jul 2026   | Working web app (all modules) + source on Git     |
| M4 | UAT Pass                | 24 Jul 2026   | Signed UAT Report & Bug-fix log                   |
| M5 | Go-Live & Handover      | 05 Aug 2026   | Deployed system, training manual, admin handover  |

---

## 🔧 Full task list

### Phase 1 — Initiation (10 days)

**1.1 Kick-off & Stakeholder Meeting** — 3 days · Both members
- Align on vision, goals, constraints with MJSCYBER director
- Resources: meeting room, MS Teams
- Predecessor: —

**1.2 Requirements Gathering** — 5 days · Khumela
- Interview instructors, students, admin staff
- Document functional & non-functional requirements
- Resources: questionnaire, recorder, notepad
- Predecessor: 1.1

**1.3 Scope Sign-off & Charter** — 2 days · Jones
- Draft Project Charter and obtain signature on scope statement
- Resources: MS Word, e-signature
- Predecessor: 1.2

---

### Phase 2 — Analysis & Design (10 days)

**2.1 Use-Case & Process Mapping** — 4 days · Khumela
- Model each business workflow using UML use-case diagrams
- Resources: draw.io / Lucidchart
- Predecessor: 1.3

**2.2 Database Schema Design (ERD)** — 5 days · Jones
- Design normalised MongoDB schema (collections: users, courses, enrolments, certificates, vip_requests, site_security, payment_transactions, login_attempts)
- Resources: MongoDB Compass, Excalidraw
- Predecessor: 1.3

**2.3 UI / UX Wireframes & Style Guide** — 5 days · Khumela
- Low- and high-fidelity wireframes; dark navy + red style guide
- Resources: Figma
- Predecessor: 2.1

**2.4 Technical Architecture Document** — 3 days · Jones
- Document 3-tier architecture, tech stack, security model
- Resources: MS Word
- Predecessor: 2.2

---

### Phase 3 — Development (30 days)

**3.1 Environment Setup & Repository** — 2 days · Jones
- Configure local dev stack, Git repo, issue tracker
- Resources: VS Code, GitHub, supervisor, MongoDB
- Predecessor: 2.4

**3.2 Authentication Module** — 6 days · Jones
- JWT httpOnly cookies, bcrypt hashing, session management, RBAC (admin/student), brute-force lockout, admin seed
- Resources: FastAPI, PyJWT, bcrypt
- Predecessor: 3.1

**3.3 Student Enrolment & Document Upload** — 8 days · Jones
- Student profile, ID/certificate upload, enrolment lifecycle (pending → active → completed/failed), payment integration (Stripe Checkout in ZAR)
- Resources: FastAPI, MongoDB, Stripe test key
- Predecessor: 3.2

**3.4 Grading & Qualification Engine** — 7 days · Jones
- Capture theory & practical marks, compute overall average, auto-set pass/fail status (≥50% = pass)
- Resources: FastAPI, MongoDB
- Predecessor: 3.3

**3.5 Certificate Issue & Public Verify Page** — 6 days · Khumela
- Generate unique serial (MJS-YYYY-XXXXXXXX), issue on completion, public `/verify/:serial` UI, downloadable PDF with QR code
- Resources: ReportLab, qrcode, React Router
- Predecessor: 3.4

**3.6 VIP & Site-Security Scheduling Module** — 7 days · Khumela
- Client requests VIP protection / site security; admin approve/reject workflow; guard allocation metadata
- Resources: FastAPI, MongoDB, JS calendar libs
- Predecessor: 3.3

**3.7 Admin Dashboard & Reporting** — 5 days · Khumela
- 7-tab dashboard: Overview (stats), Enrolments, Students, Courses (with Add/Edit modal), Certificates (PDF download), VIP, Site Security; live revenue KPI
- Resources: React, Chart.js / Recharts, Tailwind
- Predecessor: 3.4

---

### Phase 4 — Testing (10 days)

**4.1 Unit & Integration Testing** — 5 days · Jones
- Pytest suite covering auth, courses, enrolments, certificates, payments, verify endpoint
- Resources: pytest, Postman
- Predecessor: 3.7
- ✅ Completed: 34/34 tests passing

**4.2 User Acceptance Testing (UAT)** — 4 days · Khumela
- Guided UAT with MJSCYBER staff using realistic scenarios; log defects
- Resources: Test scripts, laptop, projector
- Predecessor: 4.1

**4.3 Bug Fixes & Performance Tuning** — 4 days · Both
- Resolve UAT defects; optimise DB queries; compress assets; retest
- Resources: VS Code, MongoDB profiler
- Predecessor: 4.2

---

### Phase 5 — Deployment & Handover (10 days)

**5.1 Deployment to Hosting** — 2 days · Jones
- Deploy backend + frontend to cloud (cPanel / Afrihost / AWS); configure domain, SSL, env vars
- Resources: cPanel, Let's Encrypt, MongoDB Atlas
- Predecessor: 4.3

**5.2 Staff Training & Handover Documentation** — 3 days · Khumela
- Train MJSCYBER admin staff; create user + admin manuals; record walkthrough videos
- Resources: MS Word, Loom, projector
- Predecessor: 5.1

**5.3 Go-Live & Post-Launch Support** — 5 days · Both
- Monitor live traffic, respond to incidents, tune performance for 1 week
- Resources: Hosting panel, email, monitoring dashboards
- Predecessor: 5.2

---

## 📈 Critical path

`1.1 → 1.3 → 2.2 → 3.1 → 3.2 → 3.3 → 3.4 → 4.1 → 4.3 → 5.1 → 5.3`

Any delay on these tasks delays the 05 Aug 2026 go-live date.

---

## 💰 Budget (summary)

| Line                                      | Amount (ZAR) |
|-------------------------------------------|-------------:|
| Labour (Jones + Khumela, 380 hours total) | R 68 800    |
| Non-labour (hardware, hosting, travel)    | R  8 644    |
| Subtotal                                  | R 77 444    |
| Contingency (≈ 9 %)                       | R  7 056    |
| **Grand Total**                           | **R 84 500** |

**ROI payback:** ≈ 8.9 months at R 9 500/month in administrative savings.

---

## ⚠️ Risk register (8 risks — see Project_Plan.docx for full detail)

| ID | Risk                                | P | I | Score | Mitigation                                              |
|----|-------------------------------------|---|---|-------|---------------------------------------------------------|
| R1 | Load-shedding in Bochum             | 5 | 4 | 20    | Cloud hosting + UPS + 4G hotspot                        |
| R2 | Scope creep after sign-off          | 4 | 4 | 16    | Signed scope + formal change-request form               |
| R3 | Data-security breach                | 3 | 5 | 15    | bcrypt, HTTPS-only, RBAC, encrypted file storage        |
| R4 | Key-person dependency (2-member team)| 3| 4 | 12    | Cross-training, Git, weekly pair-programming            |
| R5 | Rural low-bandwidth users           | 4 | 3 | 12    | Lightweight FE, image compression, server-side cache    |
| R6 | Hardware failure / laptop crash     | 2 | 5 | 10    | Daily Git commits + cloud backup of design assets       |
| R7 | Budget overrun                      | 3 | 3 |  9    | 9% contingency + prefer open-source tools               |
| R8 | PDF cert library integration fails  | 2 | 4 |  8    | Prototype early; fallback to DOMPDF                     |

---

## 📦 Deliverables checklist

- [x] Full-stack web application (backend + frontend) — **complete**
- [x] JWT authentication with admin + student roles — **complete**
- [x] PSIRA Grade E–A + Armed Response course catalogue — **complete**
- [x] Enrolment, grading & certification flow — **complete**
- [x] Stripe payments for tuition — **complete** (test mode)
- [x] Downloadable PDF certificates with QR verification — **complete**
- [x] Public certificate verify page — **complete**
- [x] VIP & site-security request workflow — **complete**
- [x] Admin dashboard (7 tabs) with live KPIs & revenue — **complete**
- [x] About page with mission/vision/values/timeline — **complete**
- [x] WhatsApp click-to-chat FAB — **complete**
- [x] WIL Task 1 Project Plan document (100-mark rubric) — **complete**
- [ ] SendGrid email notifications — deferred (awaiting API key)
- [ ] Instructor role + grading UI — P1 backlog
- [ ] Live production deployment — scheduled for 05 Aug 2026 (M5)
