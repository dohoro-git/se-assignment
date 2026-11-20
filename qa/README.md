# Dohoro QA Candidate Assessment

## App overview

**Dohoro Task Desk** is a small shared task-tracking web application. A candidate can create separate local demo accounts using randomly generated one-time passcodes (OTPs), keep multiple accounts signed in in one browser tab, and switch between ADMIN and VIEWER roles on the same team dashboard. The API and frontend run manually on the candidate's machine; an optional Mailpit Docker sidecar receives OTP email locally without contacting an external provider.

This repository intentionally contains **one seeded functional defect** for you to investigate. The candidate-facing brief below describes what the app is supposed to do. Your assignment is to create your own QA automation project, discover and report the defect, and submit your test code and findings. The app includes a Mailpit-only Docker Compose file for local email testing, but does not include a test framework or candidate-written tests.

## Manual setup

Prerequisites: Node.js 22.12+ (Node 24 is also supported), npm, and a current desktop browser. Docker is optional and used only to run Mailpit; the API and web app are started manually.

### Start Mailpit for default email OTPs

From the repository root:

```bash
docker compose -f qa/mailpit/compose.yaml up -d
```

Mailpit inbox: **http://127.0.0.1:8025** · SMTP: `127.0.0.1:1025`. The Compose file starts Mailpit only; the backend and frontend remain local Node processes. Stop it with `docker compose -f qa/mailpit/compose.yaml down`.

The sample backend configuration defaults to SMTP, so start Mailpit before signup. If you do not want to run Docker, set `OTP_DELIVERY=local` in `qa/backend/.env` after copying the example; signup then displays the code in the app and API response instead of sending email.

### 1. Start the API

In terminal 1:

```bash
cd qa/backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

The API listens on `http://127.0.0.1:3001`. The first database setup creates `qa/backend/prisma/qa.sqlite` and applies the checked-in SQLite migration. No seed command or external database is required. To reset the local database, stop the API and run `npm run db:reset` from `qa/backend`; then run `npm run db:setup` again.

### 2. Start the web application

In terminal 2, from the repository root:

```bash
cd qa/frontend
npm install
cp .env.example .env.local
npm run dev
```

Open **http://127.0.0.1:5173**. Vite proxies `/api` requests to `http://127.0.0.1:3001`. Keep both terminals running while exploring or testing.

In a fresh/reset database the first account is `ADMIN`; subsequent accounts are `VIEWER`. If local accounts already exist, use the existing ADMIN or reset the disposable database first. While signed in, select **Add account** to sign in/register another user in the same browser. The **Active browser session** selector switches accounts without logging the other sessions out; the session list is shared across tabs, and each tab can select a different active user. ADMIN can manage tasks; VIEWER can read the shared dashboard only.

Frontend environment setting in `qa/frontend/.env.local`:

```dotenv
API_PROXY_TARGET=http://127.0.0.1:3001
```

Backend environment settings in `qa/backend/.env`:

```dotenv
DATABASE_URL="file:./qa.sqlite"
PORT=3001
OTP_DELIVERY=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_FROM="Dohoro Task Desk <no-reply@example.test>"
```

`DATABASE_URL` is resolved by Prisma relative to `qa/backend/prisma/schema.prisma`, so the SQLite file is `qa/backend/prisma/qa.sqlite`. `PORT` controls the API port. The frontend proxy target must point at that same backend port if you change it.

### 3. Optional production-build checks

These are build checks, not candidate QA tests:

```bash
cd qa/backend && npm run build
cd ../frontend && npm run build
```

## Candidate assignment

Read [`docs/candidate-brief.md`](docs/candidate-brief.md) for the task, and [`docs/scoring-rubric.md`](docs/scoring-rubric.md) for assessment criteria. Use [`docs/frontend-setup.md`](docs/frontend-setup.md), [`docs/backend-setup.md`](docs/backend-setup.md), and [`docs/api.md`](docs/api.md) to inspect/configure the application and understand the API contract. **The rubric and feature contract state expected behavior; they do not identify the intentionally failing case.**

Choose and set up your own UI/API QA automation framework. Playwright, Cypress, WebdriverIO, Selenium, or another suitable choice is acceptable. No particular test folder, naming convention, or framework is prescribed. Keep your automation project distinct from the application source and include reproducible setup/run instructions.

## Assessment rules

- Do not change the app's source behavior to make an observed defect disappear. Your submitted tests may use normal test data and account cleanup/reset procedures.
- Use a disposable test email and password. In default SMTP mode, the OTP is sent to Mailpit's local inbox; in `OTP_DELIVERY=local` fallback mode, it is shown in the browser and signup API response.
- Keep secrets and generated database files out of your submitted ZIP.
- Submit your test source, framework/dependency configuration, a short findings report with reproduction steps, and instructions for running your suite.

## Documentation index

- [Candidate brief](docs/candidate-brief.md)
- [Scoring rubric](docs/scoring-rubric.md)
- [Frontend setup and configuration](docs/frontend-setup.md)
- [Backend setup and configuration](docs/backend-setup.md)
- [API reference](docs/api.md)
- [Mailpit setup](mailpit/README.md)

## Local security note

This is a deliberately small assessment fixture, not a deployable product. OTP email is captured by a local Mailpit service and is never relayed externally; local fallback mode can display the code without email. There is no SMS service, rate-limiting gateway, HTTPS, or production secrets management. The API and Mailpit bind to loopback and should only be used on a trusted local machine. Never reuse a real password.

The frontend stores the signed-in account list in browser `localStorage` and the active account choice per tab in `sessionStorage`. Tabs in the same browser share the available sessions but can select different users. Signing out revokes only that session; other saved sessions remain active. Local records live in SQLite. Stop the API before resetting the database.

## Branch

This QA assessment target is on branch `qa-assessment`. It provides a local web application and API for candidates to test; automation framework selection and test organization are left to each candidate.

---

*Short app description: A local-only shared team dashboard with OTP-assisted accounts, shared task CRUD, and a target for an independent QA automation assessment.*
