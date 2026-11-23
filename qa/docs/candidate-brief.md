# QA Automation Assessment — Candidate Brief

## Objective

Build a small, maintainable QA automation project for **Dohoro Task Desk**, the local task-dashboard web app. The app offers signup using a locally displayed random OTP, sign-in, and a shared team task dashboard. The application is provided; your primary deliverable is the testing framework, tests, and findings you design.

One feature scenario contains an intentional defect. Find it, create a reliable automated reproduction, and report the observed versus expected behavior. Do not change the application implementation to hide or fix it.

## What to submit

1. Your own QA automation project and all necessary dependency/configuration files.
2. Automated tests with instructions to install dependencies and execute them from a clean checkout.
3. A concise findings report with the defect's title/severity, environment, preconditions, exact reproduction steps, expected/actual result, evidence, and a clear regression-test reference.
4. A brief explanation of your test structure, coverage priorities, and any limitations or assumptions.

Keep candidate-written automation in a separate, clearly named directory (for example, `qa/automation/`) or a separate repository. Do not copy your personal credentials or generated SQLite database into your submission. Use a synthetic address such as `qa-<unique-id>@example.test` and a disposable password.

## Framework choice

Select a suitable framework and structure it yourself. **Playwright, Cypress, WebdriverIO, Selenium, or another reasonable framework are acceptable.** No particular file layout, programming language, or framework is required. Include browser/driver installation steps if your chosen framework needs them. Tests must be repeatable and runnable using the instructions you provide.

The starter deliberately contains no prewritten QA test framework, browser automation dependency, or candidate test cases. Your framework configuration and organization are part of the assessment.

## App startup

Follow [`../README.md`](../README.md). Start the API and frontend manually in separate terminal windows. For the default email-delivery mode, start the **Mailpit-only** sidecar with `docker compose -f qa/mailpit/compose.yaml up -d`; the app services are not containerized. Mailpit is at `http://127.0.0.1:8025`, the web app at `http://127.0.0.1:5173`, and API health at `http://127.0.0.1:3001/api/health`. For automation, Mailpit's local HTTP API can retrieve the latest matching message; see [`../mailpit/README.md`](../mailpit/README.md). If you cannot set up Mailpit, set `MAILPIT_SETUP=false` in `qa/backend/.env` and restart the API; the verification code will appear in the app.

To create a test account:

1. Choose **Create an account** and enter a unique disposable email and synthetic password (8+ characters).
2. With the default `MAILPIT_SETUP=true`, open Mailpit from the signup page and read the OTP email. It is captured locally and never sent to an external mail provider. With `MAILPIT_SETUP=false`, no mail service is used and the six-digit code appears directly in the app's verification panel.
3. Enter the displayed OTP to verify, then sign in with the same email/password.
4. On a fresh/reset database, the first account is `ADMIN`. From that dashboard choose **Add account** and create a second account with a different disposable email in the same browser; the second account is `VIEWER`. If local records already exist, use the existing ADMIN or reset the disposable database first.
5. Use the **Active browser session** selector to switch between accounts without signing either out. You can choose different active sessions in separate tabs of the same browser. Confirm the `ADMIN` can create/update/delete, the `VIEWER` can read but cannot write, both see the same tasks, and signing out one session leaves the other session active.

The API docs at [`api.md`](api.md) describe the contract and status codes. Setup guides: [`frontend-setup.md`](frontend-setup.md) and [`backend-setup.md`](backend-setup.md).

## Expected product behavior to validate

Use these requirements as a black-box contract, including error paths:

- Account signup should validate email/password, generate an unpredictable one-time code, send it through the configured local Mailpit SMTP receiver, reject invalid/expired/reused challenges, and allow the user to sign in after successful verification. In SMTP mode the code should arrive in Mailpit rather than be exposed in the API response.
- Sign-in should create a usable session; sign-out should revoke only that account's session. Multiple accounts should remain signed in in one browser, be switchable per tab using the account selector, and retain their independent roles. Protected APIs should reject missing/invalid sessions.
- Every OTP-verified account is a member of the same `Dohoro QA Team` workspace. The first account is assigned `ADMIN`; later accounts are `VIEWER`. Both roles can see the same task list, including tasks created by other members. `ADMIN` can create/read/update/filter/delete tasks; `VIEWER` is read-only, and the API must reject viewer writes with `403`. The server derives role and workspace membership from the session; clients cannot select or impersonate either.
- A task should identify its creator. Changes made by one signed-in member should be visible to another member after that member refreshes the dashboard. Live push updates are not promised.
- Task forms should validate title and field lengths, show useful feedback, and expose loading/success/error/empty states.
- Destructive deletion should require explicit confirmation. On confirmed deletion, the selected task should be removed and the UI should reflect the server result.
- Dashboard state should be understandable, keyboard operable, and remain usable at a narrow viewport.

Treat the contract as expected behavior, not proof the current app is correct. Investigate discrepancies rather than working around them silently.

## Suggested investigation (not a test checklist)

Choose coverage using risk and impact. Consider exploring multiple signup/auth states, email delivery and SMTP-unavailable behavior, input boundaries, repeated/parallel interactions, task lifecycle combinations, two simultaneously saved sessions in one browser, cross-role shared-task visibility and writes, per-session sign-out, authorization failures, error recovery, browser refresh, keyboard-only operation, and screen resizing. You do not need to automate every possible case; explain why your selected cases matter.

Mailpit is a local test inbox, not a production email provider; messages are not delivered externally. Use unique disposable addresses. Avoid destructive actions against unrelated data; use the reset/setup instructions for your disposable local database.

## Scoring

See [`scoring-rubric.md`](scoring-rubric.md). Assessment emphasizes test reasoning, reproducibility, coverage, and actionable defect reporting—not a particular automation vendor or the number of test files.
