# MJSCYBER Security School – Test Credentials

## Admin
- **Email:** admin@mjscyber.co.za
- **Password:** Admin@123
- **Role:** admin

## Demo Students (all password: Student@123)
| Name            | Email                   | Role    |
|-----------------|-------------------------|---------|
| Thabo Mokoena   | thabo@student.co.za     | student |
| Nandi Dlamini   | nandi@student.co.za     | student |
| Sipho Ngobeni   | sipho@student.co.za     | student |

## Auth Endpoints
- POST  `/api/auth/register`
- POST  `/api/auth/login`
- POST  `/api/auth/logout`
- GET   `/api/auth/me`
- POST  `/api/auth/refresh`

## Public Certificate Verify (no auth)
- GET `/api/verify/{serial}`
  - Seeded serials: query `GET /api/certificates` as admin to list current serials.
