# RepsBrief — PROJECT_CONTEXT (Single Source of Truth)

Last update: 2026-03-31
Owner context: AI agents + team dev

## 1) Product Scope

RepsBrief è una web app `Next.js + Supabase` per generare, organizzare e distribuire strategie contenuto basate su trend reali (scraper + AI), con workspace multi-team, calendario editoriale e integrazioni esterne.

Dominio: **repsbrief.com** (Hostinger DNS → Vercel)

## 2) Architectural Guardrails (Non-Negotiable)

- `AI abstraction`: ogni chiamata AI passa da `getAIProvider()` in `src/lib/ai/index.ts`.
- `Provider isolation`: SDK AI usati solo in `src/lib/ai/providers/*`.
- `Multi-niche centralization`: dati nicchie centralizzati in `src/config/niches.ts`.
- `TypeScript-first`: sviluppo e nuove feature in TypeScript.
- `Team-first data model`: funzioni e accessi orientati a `team_id/current_team_id` con RLS.

## 3) Stack & Core Modules

- Frontend: Next.js App Router, React, Tailwind.
- Backend: Server Actions + API routes in `src/app/actions/*` e `src/app/api/*`.
- DB/Auth/Storage: Supabase.
- Billing: Stripe (piani: `starter` free, `pro` monthly, `team` monthly).
- Mail: Resend.
- Integrations: Notion, Google Calendar, Slack, Discord, ClickUp, Trello, Webhooks (Zapier/Make).
- Integration UX direction: OAuth-first per servizi user-facing; webhook/manual setup solo fallback tecnico.

## 4) Development Progress

- [x] **Phase 1: Foundation** (Completata)
- [x] **Phase 2: Scrapers & Generator** (Completata)
- [x] **Phase 3: Automation & Delivery** (Completata)
- [x] **Phase 4: UI/UX** (Completata)
- [ ] **Phase 5: Integrazioni & Ecosystem** (In corso — ~95% completata)
  - [x] Notion, Google Calendar, Webhooks/Zapier (HMAC signed)
  - [x] Slack OAuth + notifications + hardening
  - [x] Discord OAuth + notifications
  - [x] ClickUp OAuth MVP
  - [x] Trello OAuth MVP
  - [x] Automation Logs UI
  - [x] Queue/Jobs spike (DB queue + retry/dead-letter)
  - [x] OAuth-first blueprint (tutti i provider)
  - [x] Lint/typecheck/test/build — tutto clean (2026-03-09)
  - [ ] P4.4 Observability hardening (Sentry + alerting) — backlog
  - [ ] P4.5 Publishing connectors (WordPress/Ghost) — backlog bassa priorità
  - [ ] P4.6 Cloud asset sync (Drive/Dropbox) — backlog bassa priorità
- [ ] **Phase 6: Launch** (In corso)
  - [ ] Vercel deploy + dominio repsbrief.com
  - [ ] Stripe live mode configurato (price IDs pro/team)
  - [ ] Supabase production migrations applicate
  - [ ] Guided Onboarding Tour (critico per conversioni)
  - [ ] Trends Visualizer
  - [ ] Shareable Strategy Links

## 5) UI/UX Roadmap — Pending

| ID | Feature | Priorità | Stato |
|:---|:---|:---:|:---:|
| 13 | Guided Onboarding Tour | 🔴 High | ⬜ Todo |
| 14 | Trends Visualizer | 🟡 Medium | ⬜ Todo |
| 15 | Shareable Strategy Links | 🟡 Medium | ⬜ Todo |
| 16 | Custom Theme Accents | 🟢 Low | ⬜ Todo |

UI/UX completate: 1-12 (Generazione Immersiva, Kanban, AI Remix, Brand Voice, Timeline, Teleprompter, ecc.)

## 6) Billing Config

Piani: `starter` (free) | `pro` (monthly) | `team` (monthly)

```ts
// src/lib/billing.ts
LEGACY_PRO_PRICE_ID = 'price_1T3kiQQ8w32NjQAk6830MCV3'
// env vars richieste in prod:
STRIPE_PRICE_PRO_MONTHLY=<live price ID>
STRIPE_PRICE_TEAM_MONTHLY=<live price ID>
```

## 7) Validation Snapshot (2026-03-09)

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `npm run lint` passes con `0 errors`, `0 warnings`.
- [x] `npm run test` passes.
- [x] `npm run test:e2e` passes.
- [x] `npm audit --audit-level=moderate` reports `0 vulnerabilities`.

## 8) DB / Migrations (last applied: 2026-03-09)

Tutte le migration in `supabase/migrations/` devono essere applicate in prod prima del deploy.
Migration più recente: `20260309123000_add_job_queue_spike.sql`

Variabili env richieste per prod: vedere `INTEGRATIONS_CHECKLIST.md`.

## 9) Open Risks

- `STRIPE_PRICE_PRO_MONTHLY` e `STRIPE_PRICE_TEAM_MONTHLY` non configurati in `.env` — da creare in Stripe live mode.
- Tutte le OAuth redirect URL vanno aggiornate ai domini prod (vedi `INTEGRATIONS_CHECKLIST.md`).
- Queue mode feature-flagged (`WEBHOOK_DELIVERY_MODE=queue`): attivare il cron worker `/api/cron/webhook-queue` su Vercel.
- `supabaseAdmin` fail-fast su production se `SUPABASE_SERVICE_ROLE_KEY` manca.
