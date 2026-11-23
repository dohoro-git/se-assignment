# Local OTP Mailpit Service

This Compose file starts **Mailpit only**. The QA API and React app remain installed and run manually with Node.js.

From the repository root:

```bash
docker compose -f qa/mailpit/compose.yaml up -d
```

- SMTP receiver: `127.0.0.1:1025`
- Inbox UI (and HTTP API): `http://127.0.0.1:8025`

The API's sample configuration uses `MAILPIT_SETUP=true`, `SMTP_HOST=127.0.0.1`, and `SMTP_PORT=1025`. Signup codes are sent to this local mailbox; nothing is relayed to a real email provider. Mailpit keeps messages in memory for the lifetime of the container, so stop/start clears the inbox.

Stop Mailpit when finished:

```bash
docker compose -f qa/mailpit/compose.yaml down
```

If Mailpit cannot be set up, set `MAILPIT_SETUP=false` in `qa/backend/.env` and restart the API. In that fallback mode the OTP is shown in the web app's local verification panel and included in the signup response; it is not emailed. No Docker service is required.

## Retrieving OTPs from automation

Automation can use Mailpit's loopback-only HTTP API instead of scraping the inbox page:

1. `GET http://127.0.0.1:8025/api/v1/messages` lists captured messages. Find the message whose `To` field matches the unique signup email.
2. `GET http://127.0.0.1:8025/api/v1/message/{ID}` returns the message detail, including `Text` and `HTML` bodies. Extract the six-digit code from the latest matching message.

The HTTP API needs no credentials because both ports are bound to loopback for this local fixture. Generate a unique email per test and do not hard-code OTP values.

Mailpit binds to loopback and is a disposable test service, not a production mail server.
