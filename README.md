# QA Automation Assessment — Dohoro Task Desk

A local shared task dashboard provided as a target for an independent QA automation assessment. Users create separate accounts, receive a random OTP in the local Mailpit inbox, sign in, and collaborate on one shared task list.

## Quick start

The API and web app run manually with Node.js. In the default SMTP mode, Docker is used **only** for the local Mailpit email service. For a no-Docker run, switch to the documented `OTP_DELIVERY=local` fallback.

### 1. Start Mailpit for email-based OTPs

From the repository root:

```bash
docker compose -f qa/mailpit/compose.yaml up -d
```

Inbox: [http://127.0.0.1:8025](http://127.0.0.1:8025) · SMTP: `127.0.0.1:1025`

### 2. Start the API manually

```bash
cd qa/backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

API: `http://127.0.0.1:3001` · Health: `http://127.0.0.1:3001/api/health`

### 3. Start the web app manually

In a second terminal:

```bash
cd qa/frontend
npm install
cp .env.example .env.local
npm run dev
```

Web app: `http://127.0.0.1:5173`. The frontend proxies `/api` requests to the local API. Signup OTP messages appear in Mailpit at `http://127.0.0.1:8025`.

To run without Docker, set `OTP_DELIVERY=local` in `qa/backend/.env`; the code is then shown in the web app and returned by the signup API. This fallback does not send email.

In a fresh/reset database the first verified account is ADMIN; subsequent accounts are VIEWER. From the dashboard choose **Add account** to sign in a second user in the same browser, then use the session selector while keeping both sessions active. Open another tab to select a different active role; both tabs keep their selections. If local accounts already exist, use the existing ADMIN or reset the disposable database first.

## Candidate task

Create your own QA automation framework and test organization. Playwright, Cypress, WebdriverIO, Selenium, or another appropriate framework is acceptable. The repository contains no candidate-written tests or preselected automation framework. Find the intentional failure, automate a reliable reproduction, and submit an actionable defect report. Do not change the app to hide the issue.

## Assessment documents

- [Assignment Brief](Assignment%20Brief.md) — full task and 100-point overview
- [QA app guide](qa/README.md) — detailed manual setup and configuration
- [Candidate brief](qa/docs/candidate-brief.md) — workflow, expected behavior, and deliverables
- [Frontend setup](qa/docs/frontend-setup.md)
- [Backend setup](qa/docs/backend-setup.md)
- [API reference](qa/docs/api.md)
- [Scoring rubric](qa/docs/scoring-rubric.md)
- [Mailpit setup](qa/mailpit/README.md) — local OTP email testing

Use unique synthetic emails and passwords. Do not include credentials, `.env` files, or generated SQLite databases in your submission. The fixture is local-only and is not production authentication infrastructure.
