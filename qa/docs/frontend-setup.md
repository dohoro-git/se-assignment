# Frontend Setup and Configuration

## Summary

The web client is a Vite + React + TypeScript SPA in `qa/frontend`. It uses standard npm scripts, and its development server proxies `/api/*` to the separate local Express API. Run the API and web client in separate terminals; neither is a Docker service.

## Prerequisites

- Node.js 22.12+ (or Node.js 24) and npm
- A modern browser
- The local API running on `127.0.0.1:3001`

## Install and run

```bash
cd qa/frontend
npm install
cp .env.example .env.local
npm run dev
```

Vite prints a local URL; by default it is `http://127.0.0.1:5173`. `strictPort` is enabled: if the port is already occupied, stop the process using it rather than silently switching ports. Open the printed URL in your browser.

For a frontend production bundle check:

```bash
npm run build
npm run preview
```

Preview listens at `http://127.0.0.1:4173` and retains the `/api` proxy.

## Configuration

Create `qa/frontend/.env.local` from `.env.example`:

```dotenv
API_PROXY_TARGET=http://127.0.0.1:3001
```

`API_PROXY_TARGET` is a Vite server-side setting. The browser requests same-origin paths such as `/api/auth/signin`; Vite forwards them to this target. If you change the API port in `qa/backend/.env`, update this value and restart Vite. Do not prefix this setting with `VITE_`: the frontend browser does not need a direct API URL.

## Application structure

```text
qa/frontend/src/
├── App.tsx
├── main.tsx
├── shared/api/                 # HTTP client
└── features/
    ├── auth/                   # OTP, sign-in and session handling
    │   ├── components/
    │   ├── hooks/
    │   ├── interfaces/
    │   └── routes/
    └── tasks/                  # Dashboard, task form and task list
        ├── components/
        ├── hooks/
        ├── interfaces/
        └── routes/
```

The application has no third-party UI kit. Forms use native browser controls and accessible labels. Requests go through `shared/api/client.ts`; the API remains authoritative for validation, authentication, and workspace membership. Every verified user lands in the same shared dashboard. For collaboration checks, sign into two separate browser profiles and use **Refresh shared tasks** to see the other member's changes. In SMTP mode the signup page links to Mailpit at `http://127.0.0.1:8025`; the six-digit OTP is in the received message. The local-only fallback displays the code directly.

## Troubleshooting

- **Could not reach API:** start the backend in a second terminal; check its health endpoint and the `API_PROXY_TARGET` port.
- **Port 5173 is occupied:** stop the other process or deliberately edit `server.port` and update your test base URL.
- **API returns 404 on `/api/...`:** check that the URL begins with `/api`, that the API is listening, and that the Vite proxy target is correct.
- **Changes in `.env.local` have no effect:** restart Vite after editing environment settings.

Do not commit `.env.local`, `node_modules`, or generated test artifacts.
