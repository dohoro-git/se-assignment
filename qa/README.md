# Dohoro QA Candidate Assessment

## App overview

**Dohoro Task Desk** is a small shared task-tracking web application. A candidate can create separate local demo accounts using randomly generated one-time passcodes (OTPs), sign in as each user, and collaborate on the same team dashboard and task list. The app and API run directly on the candidate's machine; no Docker, mail provider, or third-party service is needed.

This repository intentionally contains **one seeded functional defect** for you to investigate. The candidate-facing brief below describes what the app is supposed to do. Your assignment is to create your own QA automation project, discover and report the defect, and submit your test code and findings. The starter does not include a test framework or candidate-written tests.

## Manual setup

Prerequisite: Node.js 22.12+ (Node 24 is also supported), npm, and a current desktop browser. There is no Docker requirement.

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

Frontend environment setting in `qa/frontend/.env.local`:

```dotenv
API_PROXY_TARGET=http://127.0.0.1:3001
```

Backend environment settings in `qa/backend/.env`:

```dotenv
DATABASE_URL="file:./qa.sqlite"
PORT=3001
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
- Use a disposable test email and password; the OTP is shown only in the local browser inbox panel and API response. Nothing is emailed.
- Keep secrets and generated database files out of your submitted ZIP.
- Submit your test source, framework/dependency configuration, a short findings report with reproduction steps, and instructions for running your suite.

## Documentation index

- [Candidate brief](docs/candidate-brief.md)
- [Scoring rubric](docs/scoring-rubric.md)
- [Frontend setup and configuration](docs/frontend-setup.md)
- [Backend setup and configuration](docs/backend-setup.md)
- [API reference](docs/api.md)

## Local security note

This is a deliberately small assessment fixture, not a deployable product. OTP delivery is simulated locally; there is no email/SMS service, rate-limiting gateway, HTTPS, or production secrets management. The API binds to loopback and the app should only be used on a trusted local machine. Never reuse a real password.

The frontend stores its bearer session token in the current browser tab's `sessionStorage`; sign out clears the server session. Local demo records live in SQLite. Stop the API before resetting the database.

## Branch

This assessment setup is on branch `qa-assessment` in the engineering assessment repository. It is independent of the existing fleet-maintenance task and adds no Docker configuration or QA framework dependency to the root project.

---

*Short app description: A local-only shared team dashboard with OTP-assisted accounts, shared task CRUD, and a target for an independent QA automation assessment.*
