# API Reference

Base URL (API directly): `http://127.0.0.1:3001/api`

The frontend normally makes same-origin `/api/...` requests through its Vite proxy at `http://127.0.0.1:5173`. JSON requests should include `Content-Type: application/json`. Authenticated requests use `Authorization: Bearer <token>`.

Timestamps are ISO 8601 strings in UTC. IDs are UUID strings unless stated otherwise. The API binds to loopback for local assessment use only.

## Common errors

Errors use JSON with a stable `code` and human-readable `error`; validation errors may also return `details` keyed by field:

```json
{
  "code": "VALIDATION_ERROR",
  "error": "Check the submitted values.",
  "details": { "title": "String must contain at least 1 character(s)" }
}
```

| HTTP | Typical code | Meaning |
|---|---|---|
| `400` | `INVALID_JSON`, `VALIDATION_ERROR`, `OTP_INVALID` | Malformed JSON, invalid request data, or invalid/expired OTP |
| `401` | `UNAUTHORIZED`, `INVALID_CREDENTIALS` | Missing/expired session or wrong sign-in credentials |
| `403` | `FORBIDDEN` | Authenticated role is not allowed to perform the requested write |
| `404` | `TASK_NOT_FOUND`, `ROUTE_NOT_FOUND` | No matching task in the authenticated user's shared workspace or endpoint |
| `409` | `ACCOUNT_EXISTS`, `TASK_DELETE_CONFLICT` | Duplicate account or task deletion conflict |
| `413` | `PAYLOAD_TOO_LARGE` | JSON request body exceeds 10 KB |
| `429` | `OTP_ATTEMPTS_EXCEEDED` | OTP challenge used all attempts |
| `500` | `INTERNAL_ERROR`, `MAILPIT_CONFIG`, `SMTP_CONFIG` | Unexpected server failure or invalid local email configuration |
| `503` | `OTP_DELIVERY_FAILED` | The configured SMTP receiver is unavailable; no signup challenge remains active |

The server responds with `Cache-Control: no-store`. A `204` response has no body.

## Health

### `GET /health`

No authentication required.

**200 response**

```json
{ "status": "ok" }
```

## Signup and sessions

### `POST /auth/signup/request`

Starts an account signup challenge. The API generates a random six-digit, one-time code. By default (`MAILPIT_SETUP=true`), it sends the code by SMTP to the local Mailpit inbox at `http://127.0.0.1:8025`; the code is not returned in the API response. With `MAILPIT_SETUP=false`, no SMTP connection is attempted and the code is returned under `delivery.code` for display in the app. Code lifetime is 600 seconds; a challenge allows at most five failed attempts. Requesting another code replaces the active challenge for that email.

**Request**

```json
{ "email": "qa-example@example.test", "password": "ExampleOnly!234" }
```

- Email must be valid and is trimmed and lowercased.
- Password must be 8–128 characters.
- Use a disposable test email and synthetic password.

**202 response**

Default SMTP mode (`MAILPIT_SETUP=true`) returns `202`:

```json
{
  "challengeId": "c51e08b5-ae8b-4d7d-8ded-f07983f3be88",
  "expiresInSeconds": 600,
  "delivery": { "channel": "email" }
}
```

Check the local Mailpit inbox for the random six-digit code. The code itself is not included in this response.

In-app fallback (`MAILPIT_SETUP=false`) instead returns:

```json
{
  "challengeId": "c51e08b5-ae8b-4d7d-8ded-f07983f3be88",
  "expiresInSeconds": 600,
  "delivery": { "channel": "local", "code": "123456" }
}
```

A new random value is generated on each successful request. When `MAILPIT_SETUP=true`, if SMTP is unavailable the API returns `503 OTP_DELIVERY_FAILED` and removes the unsent challenge. When `MAILPIT_SETUP=false`, signup works without Mailpit. For an existing account the API returns `409 ACCOUNT_EXISTS`.

### `POST /auth/signup/verify`

Consumes a valid signup challenge and creates the account. The challenge can be used once and only before expiration.

**Request**

```json
{ "challengeId": "c51e08b5-ae8b-4d7d-8ded-f07983f3be88", "code": "123456" }
```

**201 response**

```json
{
  "user": {
    "id": "f44945f9-a5f7-47c2-9204-539e5751714e",
    "email": "qa-example@example.test",
    "role": "ADMIN",
    "workspace": { "id": "dohoro-qa-team", "name": "Dohoro QA Team" }
  }
}
```

Every verified signup joins the shared team workspace automatically; no invite or workspace ID is supplied by the user. The first account in a fresh workspace is assigned `ADMIN`; subsequent accounts are assigned `VIEWER`. The role is assigned by the server and cannot be selected in signup data.

Invalid, expired, consumed, or exhausted challenges return a `400` (`429` once no attempts remain). To restart, request a new code.

### `POST /auth/signin`

Starts an eight-hour server-side session. Multiple sessions may be active for different accounts in the same browser. Email matching uses normalized lowercase addresses; the response contains the server-assigned role.

**Request**

```json
{ "email": "qa-example@example.test", "password": "ExampleOnly!234" }
```

**200 response**

```json
{
  "user": {
    "id": "f44945f9-a5f7-47c2-9204-539e5751714e",
    "email": "qa-example@example.test",
    "role": "ADMIN",
    "workspace": { "id": "dohoro-qa-team", "name": "Dohoro QA Team" }
  },
  "token": "<random 43-character bearer token>",
  "expiresAt": "2026-11-20T16:46:03.000Z"
}
```

Wrong email/password returns `401 INVALID_CREDENTIALS` with a generic error message.

### `GET /auth/me`

Requires `Authorization: Bearer <token>`. Returns the account, current server-assigned role, and workspace for this session. The browser calls this when switching between saved sessions so role changes are refreshed from the server.

**200 response**

```json
{
  "user": {
    "id": "f44945f9-a5f7-47c2-9204-539e5751714e",
    "email": "qa-example@example.test",
    "role": "ADMIN",
    "workspace": { "id": "dohoro-qa-team", "name": "Dohoro QA Team" }
  }
}
```

### `POST /auth/signout`

Requires `Authorization: Bearer <token>`. Revokes only the current server session; other saved account sessions remain active.

**204 response** — empty body. Reusing the revoked token on a protected endpoint returns `401`.

## Tasks

All task endpoints require a valid bearer session. Every OTP-verified user automatically belongs to the single shared `Dohoro QA Team` workspace. Task reads and writes are scoped to the workspace ID from the authenticated session; the client cannot provide a workspace ID for access control. Task statuses are `TODO`, `IN_PROGRESS`, and `DONE`.

| Role | Read tasks | Create/update/delete tasks |
|---|---:|---:|
| `ADMIN` (first verified account) | Yes | Yes |
| `VIEWER` (later verified accounts) | Yes | No — API returns `403 FORBIDDEN` |

The role is stored on the account and checked by the API on every write; hiding UI controls is not the security boundary.

Task response shape:

```json
{
  "id": "a71f86d8-1104-462a-bbd7-0b43a7634cbd",
  "title": "Check account flow",
  "description": "Try with a disposable inbox",
  "status": "TODO",
  "createdAt": "2026-11-20T02:00:00.000Z",
  "updatedAt": "2026-11-20T02:00:00.000Z",
  "createdBy": { "id": "f44945f9-a5f7-47c2-9204-539e5751714e", "email": "qa-example@example.test" }
}
```

### `GET /tasks`

Lists every task in the authenticated user's shared workspace, including tasks created by other members, newest-created first. Each object identifies its creator in `createdBy`. With no tasks, returns an empty array. Changes made by another signed-in user are visible after refreshing this endpoint or the dashboard.

Optional query: `?status=TODO`, `?status=IN_PROGRESS`, or `?status=DONE`.

**200 response** — array of task objects. Example: `[ { "id": "...", "title": "Check account flow", "description": "", "status": "TODO", "createdAt": "2026-11-20T02:00:00.000Z", "updatedAt": "2026-11-20T02:00:00.000Z", "createdBy": { "id": "...", "email": "qa-example@example.test" } } ]`

### `POST /tasks`

ADMIN only. Creates a task in the shared workspace; `createdBy` is assigned from the authenticated account. `title` is required and trimmed (1–100 characters); `description` is optional (0–500 characters); `status` is optional and defaults to `TODO`. Workspace and creator IDs are never accepted from the request. Unknown fields are rejected. A VIEWER receives `403 FORBIDDEN`.

**Request**

```json
{ "title": "Verify task creation", "description": "Use the dashboard", "status": "TODO" }
```

**201 response** — created task object as above.

### `GET /tasks/:id`

Returns one task in the authenticated user's shared workspace, regardless of which member created it.

**200 response** — task object. **404 `TASK_NOT_FOUND`** for an unknown ID or an ID outside the current workspace.

### `PATCH /tasks/:id`

ADMIN only. Updates one or more fields on any task in the shared workspace. Supply at least one field. `title`, `description` and `status` follow the same limits as `POST /tasks`. Unknown fields are rejected. A task ID outside this workspace returns `404 TASK_NOT_FOUND`; a VIEWER receives `403 FORBIDDEN`. Other signed-in members see the update after they refresh their dashboard.

**Request**

```json
{ "status": "IN_PROGRESS" }
```

**200 response** — updated task object.

### `DELETE /tasks/:id`

ADMIN only. Deletes a task in the shared workspace after the UI presents an explicit confirmation. On success returns **204** with no body. A missing/out-of-workspace task returns `404 TASK_NOT_FOUND`; a VIEWER receives `403 FORBIDDEN`. The deletion is visible to other members after they refresh.

The API contract expects deletion for any task status. One application scenario is intentionally defective; discovering and documenting it is part of the assessment. Do not assume that every documented behavior is implemented correctly.

## Example curl sequence

```bash
BASE=http://127.0.0.1:3001/api
curl -s "$BASE/health"
curl -i -H 'Content-Type: application/json' \
  -d '{"email":"qa-example@example.test","password":"ExampleOnly!234"}' \
  "$BASE/auth/signup/request"
# Read challengeId and delivery.code from the local response.
curl -i -H 'Content-Type: application/json' \
  -d '{"challengeId":"<challenge-id>","code":"<six-digit-code>"}' \
  "$BASE/auth/signup/verify"
curl -s -H 'Content-Type: application/json' \
  -d '{"email":"qa-example@example.test","password":"ExampleOnly!234"}' \
  "$BASE/auth/signin"
# Use the returned token in an Authorization: Bearer header for /tasks.
```
