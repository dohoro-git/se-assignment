# Coding Standards

Use this guide for all backend and frontend changes. Prefer straightforward, typed code that fits the starter project; avoid adding abstractions without a clear need.

## Backend architecture

Keep the request path in this order:

```text
src/routes -> src/controllers -> src/services -> src/models -> Prisma/database
```

- **Routes** (`src/routes/`): declare paths, HTTP verbs, and route middleware. Do not query Prisma or implement business rules here.
- **Controllers** (`src/controllers/`): translate HTTP requests into service calls and format status codes/responses. Do not query Prisma or contain business rules.
- **Services** (`src/services/`): implement validation, authorization/business rules, tenant scoping decisions, and orchestration. Call models for persistence.
- **Models** (`src/models/`): own Prisma queries and data persistence. Return typed data; do not depend on Express request/response objects.
- **Middleware** (`src/middleware/`): implement cross-cutting request concerns such as authentication and centralized error handling.

### Backend conventions

- Use TypeScript types for request inputs and service/model boundaries. Avoid `any`; validate untrusted request data before using it.
- Use `async`/`await` and pass unexpected errors to the centralized error handler.
- Use appropriate HTTP status codes and a consistent JSON error shape.
- Derive `tenantId` from authenticated request context only. Never trust tenant IDs in the request body, query string, or URL for access control.
- Every database read/write must preserve tenant isolation. Check vehicle ownership before creating a maintenance job.
- Keep functions focused, use descriptive names, and avoid logging secrets or full authorization headers.
- Put backend tests under the relevant feature/test location or the repository's established test directory. Cover success, validation, tenant isolation, and failure paths.

## Frontend architecture

Keep frontend code feature-oriented under `frontend/src/features/`:

```text
src/
└── features/
    ├── vehicles/
    │   ├── components/
    │   ├── hooks/
    │   ├── tests/
    │   ├── routes/
    │   ├── interfaces/
    │   └── types/
    └── maintenance/
        ├── components/
        ├── hooks/
        ├── tests/
        ├── routes/
        ├── interfaces/
        └── types/
```

- Place feature screens/page components in `routes/`, reusable feature UI in `components/`, and API/state behavior in custom `hooks/`.
- Keep feature-specific interfaces and type aliases in `interfaces/` and `types/`; share genuinely cross-feature types only from a common location when needed.
- Keep tests alongside the owning feature in `tests/`. Name React components in PascalCase and hooks with the `use` prefix.
- Components should present state and user actions; do not duplicate API request logic across components.
- Use semantic HTML, labeled controls, keyboard-accessible interactions, and visible loading, empty, success, and error states.
- Never hard-code or commit a real token. Do not trust client-side tenant values for authorization; the API is authoritative.

## General

- Use consistent formatting, clear naming, and small, reviewable changes.
- Add comments to explain non-obvious decisions, not to repeat the code.
- Update `SOLUTION.md` and relevant run instructions when setup or behavior changes.
- Before submission, run the documented checks and ensure `docker compose up` starts the full application from a clean checkout.
