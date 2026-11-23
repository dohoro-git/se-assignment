# Backend Setup and Configuration

## Summary

The API is a layered Express + TypeScript service in `qa/backend`, with Prisma ORM and a local SQLite database. Its routes/controllers call services, and services call models for persistence. The API is started manually with Node.js. In the default configuration, signup OTPs are sent over SMTP to Mailpit, which is the only container in this assessment; no external email provider is used.

## Prerequisites

- Node.js 22.12+ (or Node.js 24) and npm
- Docker Desktop only if you want email delivery through Mailpit (recommended for the assessment)
- No PostgreSQL service, app container, or external mail account is required

## Start Mailpit for the default SMTP configuration

From the repository root:

```bash
docker compose -f qa/mailpit/compose.yaml up -d
```

Mailpit receives SMTP on `127.0.0.1:1025`. View messages at **http://127.0.0.1:8025**. This Compose file starts the mail receiver only; the API and frontend are still started manually.

To stop Mailpit:

```bash
docker compose -f qa/mailpit/compose.yaml down
```

## Install, initialize, and run the API manually

```bash
cd qa/backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

The API binds to loopback at `http://127.0.0.1:3001`. The unauthenticated health endpoint is `GET http://127.0.0.1:3001/api/health`. `npm run dev` watches TypeScript source changes. On the first verified signup, the API creates the shared `Dohoro QA Team` workspace and assigns `ADMIN`; subsequent verified signups join it as `VIEWER`. Role assignment is server-side and is not accepted from signup input.

Build and run the compiled API if desired:

```bash
npm run build
npm start
```

## Configuration

`qa/backend/.env`:

```dotenv
DATABASE_URL="file:./qa.sqlite"
PORT=3001
MAILPIT_SETUP=true
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_FROM="Dohoro Task Desk <no-reply@example.test>"
```

- `DATABASE_URL` is required by Prisma. The relative SQLite URL resolves against `prisma/schema.prisma`; the database file is `qa/backend/prisma/qa.sqlite`.
- `PORT` is optional and defaults to `3001`. If changed, update `API_PROXY_TARGET` in `qa/frontend/.env.local` and restart both app processes.
- `MAILPIT_SETUP=true` is the default. It sends the random OTP to the configured local SMTP receiver. `SMTP_HOST`, `SMTP_PORT`, and `SMTP_FROM` have the values shown above by default.
- `MAILPIT_SETUP=false` disables all SMTP/Mailpit calls. The signup screen shows the OTP in its local verification panel and the signup response contains `delivery.code`. This mode works without Docker or a mail service.
- If `MAILPIT_SETUP=true` but Mailpit is unavailable, signup returns `503 OTP_DELIVERY_FAILED` and removes the undelivered challenge. Start Mailpit and retry.
- If using a pre-existing `.env` with the legacy `OTP_DELIVERY=local` setting, it continues to work; prefer `MAILPIT_SETUP=false` for new setups.
- `npm run db:setup` applies the checked-in SQLite migrations and generates Prisma Client. Run it after installation and after a reset.
- `npm run db:reset` resets local database data. Stop the API first, then run `npm run db:setup` to regenerate the client.

Do not commit `.env`, SQLite files, OTPs, or real user credentials. The SMTP receiver and inbox are loopback-only and do not relay messages externally.

## Backend structure

```text
qa/backend/
├── prisma/schema.prisma
├── prisma/migrations/          # SQLite migration history
└── src/
    ├── app.ts                  # Express app composition, health and routers
    ├── index.ts                # Environment load and HTTP server startup
    ├── controllers/            # HTTP request/response handling
    ├── routes/                 # Endpoint declarations
    ├── middleware/             # Auth, async and error handling
    ├── services/               # Validation, rules and OTP delivery
    ├── models/                 # Prisma persistence access
    ├── db/client.ts
    └── errors/app-error.ts
```

## Troubleshooting

- **`DATABASE_URL` missing:** copy `.env.example` to `.env` in `qa/backend`.
- **Database has no schema:** stop the API and run `npm run db:setup`.
- **Signup returns `503 OTP_DELIVERY_FAILED`:** check `docker compose -f qa/mailpit/compose.yaml ps`, start Mailpit, and confirm SMTP port `1025` is free and reachable.
- **OTP email not visible:** open `http://127.0.0.1:8025`, use the same email address entered in signup, and check that `MAILPIT_SETUP=true`.
- **Cannot set up Mailpit:** set `MAILPIT_SETUP=false` in `qa/backend/.env` and restart the API; the OTP appears in the app's verification panel and signup response without contacting SMTP.
- **Address already in use:** change `PORT` and the frontend proxy target, or free the local port.
- **Port mismatch/API unavailable:** check `GET /api/health`, then confirm the frontend proxy target.

This backend is a local assessment fixture. Mailpit, demo passwords, and loopback sessions are not production authentication infrastructure.
