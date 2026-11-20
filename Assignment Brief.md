# QA Automation Assessment — Dohoro Task Desk

## App overview

**Dohoro Task Desk** is a local task dashboard for a small shared team. Users create accounts through an OTP signup flow, sign in, and collaborate on one shared workspace. Tasks can be created, viewed, updated, filtered by status, and deleted after confirmation.

The API generates a random OTP and sends it by SMTP to the local Mailpit inbox. No message is relayed to a real email provider. The API and frontend are installed and run manually; Docker is used only for the Mailpit sidecar. An offline local-code fallback is available if Docker is unavailable.

## Assessment objective

Create a maintainable, repeatable QA automation project for the supplied app. Build and organize your test framework yourself, investigate the app as a black box, discover the intentionally failing behavior, and provide an automated reproduction plus a clear finding.

The application is provided. Your primary deliverable is the QA automation suite, test strategy, and defect report—not changes to application functionality. Do not modify app behavior to hide or fix the intentional defect.

## Framework choice and structure

Use **Playwright, Cypress, WebdriverIO, Selenium, or another suitable automation framework**. No framework, programming language, directory layout, or test naming convention is prescribed. Set up the framework and its dependencies independently; the starter contains no candidate automation framework or prewritten candidate tests.

Keep your test project in a distinct directory (for example, `qa/automation/`) or a separate repository. Document how to install dependencies, install browsers/drivers if needed, configure the base URL, run the suite, and reproduce the reported defect from a clean checkout.

## Run the app manually

Use Node.js 22.12+ (or Node.js 24), npm, and a modern browser. Docker is used only for local Mailpit; do not containerize the API or frontend.

0. Start Mailpit from the repository root (recommended default OTP mode):

   ```bash
   docker compose -f qa/mailpit/compose.yaml up -d
   ```

   Inbox: `http://127.0.0.1:8025`; SMTP receiver: `127.0.0.1:1025`.

1. Start the API in terminal 1:

   ```bash
   cd qa/backend
   npm install
   cp .env.example .env
   npm run db:setup
   npm run dev
   ```

   API: `http://127.0.0.1:3001`; health check: `http://127.0.0.1:3001/api/health`.

2. Start the frontend in terminal 2:

   ```bash
   cd qa/frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

   Web app: `http://127.0.0.1:5173`. Keep both terminals running. Vite proxies `/api` requests to the API.

The complete manual configuration, environment settings, and reset instructions are in [`qa/docs/backend-setup.md`](qa/docs/backend-setup.md), [`qa/docs/frontend-setup.md`](qa/docs/frontend-setup.md), [`qa/mailpit/README.md`](qa/mailpit/README.md), and [`qa/README.md`](qa/README.md).

## Account and shared dashboard workflow

1. Choose **Create an account** and use a unique disposable email and a synthetic password of at least 8 characters.
2. Submit the signup form and read the random six-digit code from the message in Mailpit. It is captured locally and not relayed to an external provider. If using `OTP_DELIVERY=local`, the code is displayed in the app instead.
3. Verify the account, then sign in.
4. Create a second account with a different disposable email. Sign in through a separate browser profile/window to use two accounts independently.
5. Verify that both accounts see the same **Dohoro QA Team** workspace and task list. A member's changes are visible to another member after clicking **Refresh shared tasks**; live push updates are not promised.

Do not use a real password. Each verified account automatically joins the one local shared workspace. Workspace scope is derived from the authenticated session, not a client-supplied workspace ID.

## Expected behavior to test

Use the documented product behavior as the black-box contract. Verify both positive and negative paths, and report discrepancies rather than silently working around them.

- Signup validates email/password, generates an unpredictable one-time code, emails it to Mailpit in SMTP mode, rejects invalid/expired/reused codes, and creates an account after successful verification. In SMTP mode the API must not expose the code in its response. Test the configured delivery-failure path as well.
- Sign-in creates a usable session. Sign-out revokes it. Protected API routes reject missing or invalid sessions.
- All verified accounts belong to the shared workspace. Members can see tasks created by other members and can create, read, update, filter, and delete workspace tasks.
- Each task identifies its creator. Changes made from one member's session are visible to other members after refresh.
- Task forms validate required values and field limits and provide useful loading, empty, success, and error feedback.
- Deletion requires an explicit confirmation, and successful deletion is reflected in the list.
- The dashboard remains understandable, keyboard operable, and usable at a narrow viewport.

For endpoint paths, request/response examples, status codes, and error shapes, use [`qa/docs/api.md`](qa/docs/api.md). For the full candidate task and suggested exploration areas, see [`qa/docs/candidate-brief.md`](qa/docs/candidate-brief.md).

## Deliverables

Submit:

1. Your independently configured automation project, tests, and required framework configuration/dependencies.
2. Clear clean-checkout setup and run instructions.
3. A concise defect report: title/severity, environment, preconditions, exact reproduction steps, expected versus actual result, evidence, and the automated regression test that reproduces it.
4. A brief explanation of your test structure, coverage choices, assumptions, and known limitations.

Use unique disposable accounts and keep credentials, `.env` files, database files, and other generated local data out of your submission. Follow the submission process provided by the assessor.

## Scoring rubric — 100 points

| Area | Points |
|---|---:|
| Framework ownership and repeatable setup | 15 |
| Test strategy and risk prioritization | 15 |
| Functional flows and task lifecycle | 20 |
| Validation, boundaries, and negative cases | 15 |
| Multi-user collaboration and data management | 10 |
| Defect discovery and regression reproduction | 10 |
| Maintainability and diagnostic quality | 10 |
| Accessibility, responsive behavior, and browser considerations | 5 |
| **Total** | **100** |

Scoring details and anchors are in [`qa/docs/scoring-rubric.md`](qa/docs/scoring-rubric.md). Framework choice is not scored; quality, reproducibility, reasoning, and evidence are.

## Documentation

- [`qa/README.md`](qa/README.md) — app overview and quick manual setup
- [`qa/docs/candidate-brief.md`](qa/docs/candidate-brief.md) — candidate workflow and expected behavior
- [`qa/docs/frontend-setup.md`](qa/docs/frontend-setup.md) — frontend setup/configuration
- [`qa/docs/backend-setup.md`](qa/docs/backend-setup.md) — API/database setup/configuration
- [`qa/mailpit/README.md`](qa/mailpit/README.md) — Mailpit-only SMTP service setup
- [`qa/docs/api.md`](qa/docs/api.md) — endpoint and request/response reference
- [`qa/docs/scoring-rubric.md`](qa/docs/scoring-rubric.md) — detailed scoring criteria

## Local-use and security note

This fixture is intended for local assessment only. OTP delivery is simulated, the API binds to loopback, and the app is not production authentication infrastructure. Do not expose it to an untrusted network or use real personal credentials.
