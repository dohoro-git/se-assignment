# Backend Setup and Configuration

## Summary

The API is a layered Express + TypeScript service in `qa/backend`, with Prisma ORM and a local SQLite database. Its HTTP routes/controllers call services, and services call models for persistence. This keeps the assessment runnable without Docker, Postgres, an email server, or external accounts.

## Prerequisites

- Node.js 22.12+ (or Node.js 24) and npm
- No Docker, separate database service, or mail service is needed

## Install, initialize, and run

```bash
cd qa/backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

The API binds to loopback and listens at `http://127.0.0.1:3001`. The health endpoint is `GET http://127.0.0.1:3001/api/health` and needs no authentication. `npm run dev` watches TypeScript source changes.

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
```

- `DATABASE_URL` is required by Prisma. A relative SQLite URL is resolved against `prisma/schema.prisma`; the resulting file is `qa/backend/prisma/qa.sqlite`.
- `PORT` is optional and defaults to `3001`. Choose an available port between 1 and 65535. If changed, also update `API_PROXY_TARGET` in `qa/frontend/.env.local` and restart both servers.
- `npm run db:setup` applies the checked-in Prisma migration and generates the Prisma client. Run this once after installation or after a database reset.
- `npm run db:reset` removes local database data and reapplies migrations. Stop the API first. Run `npm run db:setup` after reset to generate the client as well.

Do not commit `.env`, SQLite database files, or any real user credentials. The OTP is returned to the caller for local display; there is no mail delivery configuration.

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
    ├── services/               # Input validation and application rules
    ├── models/                 # Prisma persistence access
    ├── db/client.ts
    └── errors/app-error.ts
```

## Troubleshooting

- **`DATABASE_URL` missing:** copy `.env.example` to `.env` in `qa/backend`.
- **Database has no schema:** stop the API and run `npm run db:setup`.
- **Address already in use:** change `PORT` and matching frontend proxy target.
- **OTP not emailed:** expected; the code is displayed in the local inbox UI and in the signup-request API response.
- **Port mismatch or API unavailable in browser:** check `GET /api/health` directly, then confirm the frontend proxy target.

This backend is a local assessment fixture. The simulated OTP response, loopback-only server and demo password flow are not production authentication practices.
