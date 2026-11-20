# QA Automation Assessment — Dohoro Task Desk

A local shared task dashboard provided as a target for an independent QA automation assessment. Users create separate accounts with a locally displayed OTP, sign in, and collaborate on one shared task list.

## Quick start (manual, no Docker)

Prerequisites: Node.js 22.12+ (or Node.js 24), npm, and a modern browser.

**Terminal 1 — API:**

```bash
cd qa/backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

API: `http://127.0.0.1:3001` · Health: `http://127.0.0.1:3001/api/health`

**Terminal 2 — web app:**

```bash
cd qa/frontend
npm install
cp .env.example .env.local
npm run dev
```

Web app: `http://127.0.0.1:5173`. Keep both servers running. The frontend proxies `/api` requests to the local API.

Create a second disposable account and sign in using a separate browser profile to check shared dashboard access. Each verified account joins the same local team. The OTP appears in the **Local OTP inbox** panel; no email is sent.

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

Use unique synthetic emails and passwords. Do not include credentials, `.env` files, or generated SQLite databases in your submission. The fixture is local-only and is not production authentication infrastructure.
