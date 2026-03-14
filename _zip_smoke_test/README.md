# Smart Academic Query & Doubt Resolution Platform

A practical AI workflow app for internal education support teams with real LLM integration and optional automation hooks.

## What it solves

It automates repetitive student and parent support requests by:

- Classifying incoming queries into operational categories
- Assigning priority and confidence
- Generating safe, action-oriented draft responses
- Deciding auto-send vs human escalation
- Logging all interactions for reporting

## Features

- Modern responsive UI with strong visual hierarchy
- Real backend API flow (classification -> reply -> escalation)
- LLM mode when `OPENAI_API_KEY` is configured
- Safe fallback mode when API key is missing or unavailable
- Escalation rules for low confidence, sensitive language, and policy gaps
- Optional webhook push for Zapier/Make and Google Sheets
- Local activity log (stored in browser localStorage)
- CSV export for reporting and analysis
- Prompt engineering section displayed in the app

## Files

- `index.html` -> main UI
- `styles.css` -> visual design and responsive layout
- `app.js` -> workflow engine and data logging
- `server.js` -> API, LLM integration, and webhook forwarding
- `AI_Agent_Assignment_Vriddhikar.md` -> assignment write-up document

## Run locally

1. Install dependencies:

```bash
npm install
```

1. Create environment file:

```bash
copy .env.example .env
```

1. Set values in `.env`:

- `OPENAI_API_KEY` for real LLM output
- Optional `AUTOMATION_WEBHOOK_URL` for Zapier/Make
- Optional `SHEETS_WEBHOOK_URL` for Google Sheets webhook logging

1. Start server:

```bash
npm start
```

1. Open:

- `http://localhost:3000`

1. Submit a query and check the status pill in the UI:

- `LLM mode active` means real API is running
- `fallback mode` means offline-safe logic is being used

## API endpoints

- `GET /api/health` -> checks backend and integration flags
- `POST /api/process` -> processes one support query

## Suggested next upgrades

1. Add Gmail API read/reply for full inbound email automation.
2. Add Google OAuth-based native Sheets write (instead of webhook).
3. Add admin dashboard with SLA charts by category and owner team.
4. Add role-based review queue with approve/edit/send actions.
