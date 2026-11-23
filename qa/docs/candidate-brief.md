# QA Automation Assessment — Candidate Brief

## Objective

Build a maintainable QA automation project for **Dohoro Task Desk**, a shared task-dashboard web app. The app supports OTP signup (sent to local Mailpit by default, or displayed in-app when `MAILPIT_SETUP=false`), sign-in, two roles, and shared task CRUD. The application is provided; your primary deliverable is the framework, tests, debugging evidence, and findings you design.

One feature scenario contains an intentional defect. Find it, create a reliable automated reproduction, and report the observed versus expected behavior. Do not change the application implementation to hide or fix it.

## What to submit

1. Your independently structured QA automation project, tests, and dependency/configuration files.
2. A reproducible test command and documentation for clean setup, configuration, all-tests and individual-test execution.
3. A concise bug report for the intentionally failing feature: title/severity, environment, preconditions, exact steps, expected/actual results, evidence, and regression-test reference.
4. Debugging evidence or a short explanation of how you investigated a failed run (trace, screenshot, logs, report, or an equivalent tool output).
5. A coverage summary listing what you automated, what you did not automate, why, limitations, and future opportunities.

Keep candidate-written automation in a separate, clearly named directory (for example, `qa/automation/`) or a separate repository. Do not copy your personal credentials or generated SQLite database into your submission. Use unique synthetic addresses and disposable passwords.

## Framework choice

Select a suitable framework and structure it yourself. **Playwright, Cypress, WebdriverIO, Selenium, or another reasonable framework are acceptable.** No particular file layout, programming language, or framework is required. Include browser/driver installation steps if your chosen framework needs them. Tests must be repeatable and runnable using the instructions you provide.

The starter deliberately contains no prewritten QA test framework, browser automation dependency, or candidate test cases. Your framework configuration and organization are part of the assessment.

## Required framework documentation

Include a README (or equivalent) that lets another evaluator set up, execute, debug, and understand your automation independently. Cover:

1. **Framework setup and execution:** required software, dependency/browser installation, environment variables, base URL, commands for the full suite and an individual test.
2. **Third-party tools/dependencies:** what each is used for, setup/configuration (including Mailpit where applicable), and how tests report or handle service failures.
3. **Execution and debugging:** supported run modes, framework inspector/debug mode, screenshots/traces, reports, and troubleshooting commands. For Playwright, document Inspector, Trace Viewer, and report commands; other tools should document equivalents.
4. **Implemented framework features:** what you actually implemented (for example, POM, fixtures/hooks, API helpers, test data, retries, parallelism, auth state, network interception, and reporting) and why.
5. **Coverage decisions:** feature-wise automated scenarios, scenarios not automated and why, limitations, and future opportunities.

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

- Signup validates email/password, generates an unpredictable OTP, sends it to Mailpit when `MAILPIT_SETUP=true`, and rejects invalid, expired, or reused codes. With `MAILPIT_SETUP=false`, the OTP is displayed in-app and signup remains usable without Docker.
- Valid credentials sign in and navigate to the dashboard. Invalid credentials fail with useful feedback. Required email/password fields and invalid inputs are validated.
- A user can sign out; the API revokes only that account session. Protected routes reject missing/invalid sessions, and expired sessions return the user to sign-in.
- On a fresh/reset database, the first verified account is `ADMIN`; later accounts are `VIEWER`. The API assigns roles and ignores any client role override.
- Multiple users can be signed in at once in the same browser. The account list is shared across tabs while each tab can choose its own active account. Separate browser contexts must also keep their sessions isolated.
- All users see the shared `Dohoro QA Team` task list, including tasks created by other users. `ADMIN` can create, read, update, filter, and delete tasks; `VIEWER` can read but receives `403` for writes.
- Validate the complete task CRUD lifecycle: create and verify a record, update and verify it, delete and verify it is gone. The UI requires confirmation before destructive deletion.
- A task identifies its creator; changes from another session are visible after refresh. Live push updates are not promised.
- One feature scenario is intentionally failing. Discover it, automate a stable reproduction, explain expected versus actual behavior, and investigate the likely cause without changing app code to hide it.
- Forms and pages provide useful validation, loading, empty, success, and error states. The dashboard remains keyboard operable and usable at narrow viewport sizes.

Treat the contract as expected behavior, not proof the current app is correct. Investigate discrepancies rather than working around them silently.

## Suggested investigation (not a test checklist)

Choose coverage using risk and impact. Consider exploring multiple signup/auth states, email delivery and SMTP-unavailable behavior, input boundaries, repeated/parallel interactions, task lifecycle combinations, two simultaneously saved sessions in one browser, cross-role shared-task visibility and writes, per-session sign-out, authorization failures, error recovery, browser refresh, keyboard-only operation, and screen resizing. You do not need to automate every possible case; explain why your selected cases matter.

Mailpit is a local test inbox, not a production email provider; messages are not delivered externally. Use unique disposable addresses. Avoid destructive actions against unrelated data; use the reset/setup instructions for your disposable local database.

## Scoring

See [`scoring-rubric.md`](scoring-rubric.md). Assessment emphasizes test reasoning, reproducibility, coverage, and actionable defect reporting—not a particular automation vendor or the number of test files.
