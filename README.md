# Dohoro Assignment — Starter Repo

Fleet maintenance scheduling API. Node.js · TypeScript · PostgreSQL · Prisma · Express.

---

## Prerequisites

- Docker + Docker Compose
- Git
- Node.js 18+ only if you want to run helper commands outside Docker

---

## Setup (~10 minutes)

**1. Clone the starter repository**
```bash
git clone https://github.com/dohoro-git/se-assignment.git
cd se-assignment
```

**2. Start the starter API and database**
```bash
docker compose up --build
```

Compose waits for PostgreSQL, applies the Prisma schema, seeds the demo tenants and vehicles on first startup, then starts the API. The API is available at `http://localhost:3000`.

**3. Verify setup** (in another terminal)
```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

As part of Task 4, add the React frontend as a Compose service. A completed assignment must start the database, API, and React application together from a clean checkout using the same `docker compose up --build` command; once built, `docker compose up` must also start the full stack. No manual migration, seed, or separate frontend start command should be required.

To stop the services, press `Ctrl+C` and run `docker compose down`. To remove the local database volume and reset demo data, run `docker compose down -v` before starting again.

---

## Test Tokens

Generate demo JWT tokens for both seeded tenants. Use them in the
`Authorization: Bearer <token>` header for all requests.

Generate them once while the API container is running:
```bash
docker compose exec api npm run tokens
```

You will get two tokens — copy them into your HTTP client (Postman, Insomnia,
curl, or `.http` file).

**Dohoro Fleet token** — has access to vehicles `veh-dohoro-001`, `veh-dohoro-002`, `veh-dohoro-003`  
**Acme Logistics token** — has access to vehicles `veh-acme-001`, `veh-acme-002`

A request with the Dohoro token must never return Acme data, and vice versa.

---

## Existing Endpoint

```
GET /vehicles
Authorization: Bearer <token>
```

Returns all vehicles for the authenticated tenant. Trace the reference implementation through `src/routes/vehicles.ts` → `src/controllers/vehicles.controller.ts` → `src/services/vehicles.service.ts` → `src/models/vehicle.model.ts` to see the required backend layer flow.

## Architecture and Coding Standards

Backend changes must follow **routes → controllers → services → models → Prisma/database**. Keep route files thin, put HTTP request/response handling in controllers, business rules and tenant scoping in services, and Prisma queries in models. Do not call Prisma directly from a route or controller. Use the centralized error handler and typed request/service data.

Frontend work belongs in `frontend/src/features/<feature-name>/` with `components/`, `hooks/`, `tests/`, `routes/`, `interfaces/`, and `types/`. The starter includes `vehicles` and `maintenance` feature folders. See [`CODING_STANDARDS.md`](CODING_STANDARDS.md) and [`frontend/README.md`](frontend/README.md) for detailed conventions.

---

## Your Tasks

See **Assignment Brief.md** for full requirements.

| Task | Endpoint | Implementation layers |
|---|---|---|
| 1 | POST /maintenance | `src/routes/maintenance.ts` → `src/controllers/maintenance.controller.ts` → `src/services/maintenance.service.ts` → `src/models/maintenance.model.ts` |
| 2 | GET /maintenance | `src/routes/maintenance.ts` → `src/controllers/maintenance.controller.ts` → `src/services/maintenance.service.ts` → `src/models/maintenance.model.ts` |
| 3 | Automated trigger | `src/services/vehicles.service.ts` and `src/models/maintenance.model.ts` |
| 4 | React application | `frontend/src/features/vehicles/` and `frontend/src/features/maintenance/` |
| 5 | Optional RBAC | API routes, controllers, services, and authorization middleware |

---

## Useful Commands

```bash
docker compose up --build       # build and start the stack
docker compose logs -f api      # follow API logs
docker compose exec api npm run tokens  # print demo JWT tokens
docker compose down             # stop services, keep database data
docker compose down -v          # stop services and reset database volume
```

---

## Submitting

1. Clone the public assignment repository from `https://github.com/dohoro-git/se-assignment` and complete your work in your local copy. Do not push your solution to the public upstream repository.
2. Create a ZIP containing your source code, tests, Dockerfiles, `docker-compose.yml`, and `SOLUTION.md`. Exclude `.git/`, `node_modules/`, `.env` files, and secrets.
3. Email the ZIP to **support@dohoro.com** with subject: `Assignment — [Your Name] — [Role]`.

We will review within 24 hours.
