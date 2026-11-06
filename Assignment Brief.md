# Dohoro Engineering Assignment

**Role:** Associate / Full-Stack Software Engineer  
**Time budget:** 8–10 hours  
**Backend stack:** Node.js · TypeScript · PostgreSQL · Prisma · Express  
**Frontend:** React (TypeScript recommended; use the starter repo's tooling or document any added setup)

---

## Context

Dohoro builds fleet and asset management software used by companies to track vehicles and schedule maintenance. This assignment simulates a small product task: extend an existing API and build a usable web interface for it.

You will work in the provided starter repository. Tasks 1–4 are **mandatory**. Task 5 is **optional** and can earn bonus marks.

---

## What You Will Build

### Task 1 — `POST /maintenance` (Mandatory)

Create a maintenance job for a vehicle belonging to the authenticated tenant.

**Requirements:**
- Accept `vehicleId`, `type`, `scheduledAt` (ISO date string), and optional `notes`.
- Validate required values and reject malformed input with an appropriate client error.
- The vehicle must belong to the authenticated tenant. Return `403` if the vehicle is outside that tenant; do not disclose another tenant's data.
- Return the created maintenance job on success.

**Example request:**
```http
POST /maintenance
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{
  "vehicleId": "veh-dohoro-001",
  "type": "Oil Change",
  "scheduledAt": "2026-11-20T09:00:00.000Z",
  "notes": "Also check brake pads"
}
```

### Task 2 — `GET /maintenance` (Mandatory)

Return the authenticated tenant's upcoming, non-completed maintenance jobs, ordered by `scheduledAt` ascending.

**Requirements:**
- Only return jobs belonging to vehicles owned by the authenticated tenant.
- Exclude jobs with status `COMPLETED`.
- Include the vehicle's `licensePlate` and `make` in each result.
- Handle an empty result clearly.

### Task 3 — Automated Maintenance Trigger (Mandatory)

Extend the existing `GET /vehicles` behavior through the starter's service layer (`src/services/vehicles.service.ts`), following routes → controller → service → model. Do not put the trigger logic directly in the route or controller.

**Requirement:** For every vehicle belonging to the authenticated tenant whose `lastServiceDate` is more than **90 days ago** (or has never been set), automatically create a `PENDING` maintenance job of type `"Routine Service"`—but only if one does not already exist for that vehicle.

Return the vehicle list as before. Keep tenant isolation intact and avoid creating duplicate jobs when the endpoint is called repeatedly.

### Task 4 — React Fleet & Maintenance Application (Mandatory)

Build a React application that uses the APIs implemented/provided in this assignment. The application must use:
- `GET /vehicles`
- `GET /maintenance`
- `POST /maintenance`

**Core requirements:**
- Provide a clear way to supply the bearer token for local/demo use. Do not commit real secrets or hard-code a working token in source code.
- Show the authenticated tenant's vehicles and maintenance jobs using live API responses.
- Let the user create a maintenance job by selecting a vehicle and entering the required details; refresh/update the relevant view after successful creation.
- Include sensible loading, empty, success, and error states, including API validation/authentication errors.
- Ensure the interface is responsive and usable on desktop and mobile.
- Show creativity and product-design judgment: create a coherent visual identity, thoughtful hierarchy, and polished interactions rather than a plain collection of unstyled forms. You may choose the layout and visual direction.
- Do not replace the API with mocked data for the submitted working flow. If you add sample/demo data for a separate preview, label it and ensure the real API integration is still demonstrable.

Build the app in the starter's `frontend/` directory, organized under `frontend/src/features/<feature-name>/` using the provided `components/`, `hooks/`, `tests/`, `routes/`, `interfaces/`, and `types/` folders. Include exact run/configuration instructions and explain the API base URL or any local CORS/proxy configuration needed.

**Docker requirement (mandatory):** Provide a Dockerfile for each app service and a Docker Compose configuration so that, from a clean checkout, running `docker compose up --build` starts the database, API, and React application together. Database readiness, schema setup/migrations, and demo seeding must be handled by the configured startup flow; reviewers must not need to run separate manual setup commands. After the images have been built, `docker compose up` must bring the complete app up. Document the local URLs and any test-token setup. Keep secrets out of committed files.

### Task 5 — Role-Based Access Control (Optional Bonus)

Implement RBAC on **each endpoint in scope**: `GET /vehicles`, `POST /maintenance`, and `GET /maintenance`.

Define a small, explicit role matrix (for example, viewer/read-only and maintenance manager/write access), enforce authorization on the server rather than only hiding UI controls, and preserve tenant isolation. Document the roles, permissions, and how to obtain/use a test role. Add tests or reproducible examples showing both permitted and denied requests.

This task is optional and is scored as bonus; it does not replace or compensate for incomplete mandatory tasks.

---

## Code Organization and Standards

Follow the starter's layered backend architecture:

```text
src/routes -> src/controllers -> src/services -> src/models -> Prisma/database
```

Keep routes limited to HTTP method/path declarations and middleware. Controllers handle HTTP input/output and call services; services own validation, tenant-aware business rules, and orchestration; models own Prisma queries and persistence. Do not put Prisma queries in routes or controllers. Use typed inputs, centralized error handling, and the authenticated tenant context for every tenant-scoped read or write.

Organize frontend work by feature under `frontend/src/features/<feature-name>/`, following this structure:

```text
components/  reusable feature UI
hooks/       feature state and API behavior
tests/       feature tests
routes/      feature pages/screens
interfaces/  feature-specific object contracts
types/       feature-specific aliases and unions
```

The starter includes `vehicles` and `maintenance` feature folders. Follow the detailed conventions in `starter-repo/CODING_STANDARDS.md`: use clear TypeScript types, focused components/functions, accessible controls, consistent loading/error/empty states, and tests for important behavior. Avoid duplicating API calls across UI components or trusting client-supplied tenant identifiers.

---

## Rules and Expectations

- **AI tools are allowed and encouraged.** What matters is that you understand and can explain every line you submit. If you use an AI tool, disclose it in `SOLUTION.md` and mention one place where you reviewed, corrected, or changed its output.
- **Do not over-engineer.** Prioritize a correct, understandable solution that covers all mandatory requirements.
- **Ask one or two questions if something is genuinely ambiguous.** We value clarifying questions over silently building the wrong thing.
- Keep tenant data isolated in every API query and mutation. Never trust a tenant or role identifier supplied only by the client.
- Use the provided starter repository and follow its existing patterns where sensible. Document intentional deviations.

---

## Deliverables

The assignment repository will be publicly available under the GitHub account [`dohoro-git`](https://github.com/dohoro-git/se-assignment). Clone that repository, make your changes in your own working copy, and submit a ZIP of your completed solution. Do not push candidate work back to the public assignment repository.

Your ZIP must include all source code, Dockerfiles, the Compose configuration, tests, and `SOLUTION.md`. Exclude `.git`, `node_modules`, `.env` files, credentials, and other secrets.

1. Working code for mandatory Tasks 1–4; Task 5 is optional.
2. Dockerfiles and a Docker Compose configuration that starts the database, API, and React application together with one command, including schema setup/migrations and demo data initialization.
3. Backend and frontend tests (or clear reproducible test instructions) for core flows, tenant isolation, and important edge cases.
4. A `SOLUTION.md` at the repository root with:
   - How to install and run the backend and frontend.
   - How to configure the database, API base URL, and test authentication.
   - Key decisions and assumptions.
   - How you tested the solution and any known limitations.
   - One thing you would improve with more time.
   - Whether you used AI tools and where, including one reviewed/corrected output.
   - If Task 5 is attempted, the role/permission matrix and test instructions.

Do not include real secrets, personal access tokens, or production data in your submission.

---

## Setup

Clone the starter repository and follow its `README.md`. For a completed submission, reviewers must be able to start the full application from a clean checkout with `docker compose up --build` (or `docker compose up` after the images have been built). This must start PostgreSQL, apply the schema/migrations, seed demo data, and start both the API and React app without separate manual setup commands. Document the web and API URLs and how to generate/use demo JWT tokens. Before changing the backend, confirm that the existing `GET /vehicles` endpoint works.

---

## Evaluation Rubric (100 points + 10 optional bonus)

### Mandatory work — 100 points

| Area | Points | What earns the marks |
|---|---:|---|
| Task 1: `POST /maintenance` | 15 | Correct creation and response (6); tenant ownership enforced without data leakage (5); input/date validation and useful error responses (4). |
| Task 2: `GET /maintenance` | 15 | Correct tenant-scoped, non-completed results and ascending ordering (7); required vehicle fields included (4); empty/error cases handled appropriately (4). |
| Task 3: Automated trigger | 20 | Correct overdue/never-serviced condition and pending routine job (8); no duplicate jobs across repeated calls (7); tenant scope and safe, reliable implementation (5). |
| Task 4: React app and product design | 25 | Real integration with all three endpoints and a working create flow (10); clear, polished visual design and coherent product experience (7); responsive layout and accessible/usably labeled controls (4); loading, empty, success, and error states (4). |
| Testing and engineering quality | 10 | Meaningful coverage of core behavior and tenant boundaries (6); readable, maintainable code that fits the starter (2); useful error handling and reproducible tests (2). |
| Docker Compose and one-command startup | 5 | Clean-checkout `docker compose up` starts DB, API, and React app (3); readiness, schema setup, and seed data are handled automatically (2). |
| `SOLUTION.md` and communication | 10 | Clear run/configuration instructions and decisions (4); assumptions, test results, limitations, and time trade-off explained (4); accurate AI-use disclosure if applicable (2). |
| **Mandatory total** | **100** | Tasks 1–4 and the Docker startup requirement are all required. |

### Optional bonus — up to 10 points

| Area | Bonus | What earns the marks |
|---|---:|---|
| Task 5: RBAC | 10 | Explicit role/permission matrix (2); server-side enforcement on all three endpoints (4); tenant isolation remains enforced (2); tests or reproducible permitted/denied examples and clear documentation (2). |

Marks within each area reflect correctness, completeness, and clarity. Partial credit is available. A visually attractive frontend alone does not substitute for working API integration; likewise, correct endpoints do not substitute for the required React application. The optional RBAC score is additional and cannot make up for missing mandatory requirements.

---

## What We Are Looking For

| We want to see | We are not looking for |
|---|---|
| Working endpoints with sensible edge-case handling | Perfect code for a time-boxed task |
| Tenant isolation enforced at the data layer | Microservices or complex abstractions |
| A real, usable React client with a thoughtful design | A static mockup disconnected from the APIs |
| Clear reasoning and reproducible setup | Exhaustive documentation |
| Sensible use of the existing code patterns | Rewriting the whole starter without reason |
| Awareness of what could go wrong | Handling every imaginable error scenario |

---

## Submission

Submit the completed solution as a ZIP attachment to **support@dohoro.com** with subject line:

`Assignment — [Your Name] — [Role Applied For]`

Your changes should be made in a local clone of the public assignment repository hosted under [`dohoro-git`](https://github.com/dohoro-git/se-assignment). Do not submit a repository link instead of the ZIP, and do not push your solution to the public upstream repository. We will review the ZIP and, if shortlisted, schedule a 45-minute walkthrough call. In that call you will walk us through your solution and we may extend it together live.

Good luck.
