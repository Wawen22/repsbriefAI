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
- [ ] **Phase 6: Launch** (In corso — 2026-03-31)
  - [x] Vercel deploy → https://repsbrief.com (GitHub CI/CD attivo)
  - [x] Stripe live mode: Pro $19/mo, Team $39/mo; Starter = Free
  - [x] Supabase prod migrations applicate (tutte, inclusa job_queue)
  - [x] YouTube API key configurata
  - [x] DNS repsbrief.com → 76.76.21.21 (Hostinger A record, propagazione in corso)
  - [x] OAuth redirect URLs aggiornate a repsbrief.com per tutti i provider (Slack, Discord, Notion, Google, ClickUp, Trello)
  - [x] Guided Onboarding Tour — interactive wizard 3-step + persistent checklist widget
  - [ ] Trends Visualizer
  - [ ] Shareable Strategy Links
  - [ ] Reddit API (in attesa approvazione)

## 5) UI/UX Roadmap — Pending

| ID | Feature | Priorità | Stato |
|:---|:---|:---:|:---:|
| 13 | Guided Onboarding Tour | 🔴 High | ⬜ Todo |
| 14 | Trends Visualizer | 🟡 Medium | ⬜ Todo |
| 15 | Shareable Strategy Links | 🟡 Medium | ⬜ Todo |
| 16 | Custom Theme Accents | 🟢 Low | ⬜ Todo |

UI/UX completate: 1-12 (Generazione Immersiva, Kanban, AI Remix, Brand Voice, Timeline, Teleprompter, ecc.)

## 6) Billing Config (Live — 2026-03-31)

Piani: `starter` (free) | `pro` ($19/mo) | `team` ($39/mo)

```
STRIPE_PRICE_PRO_MONTHLY=price_1TH3ecQ8w32NjQAk0KMEetVv
STRIPE_PRICE_TEAM_MONTHLY=price_1TH3ecQ8w32NjQAkpJYZtYq9
STRIPE_WEBHOOK_SECRET=whsec_A3tNpDermwvOkV2FT8N4vouOxns8OrHI
Webhook endpoint: https://repsbrief.com/api/stripe/webhook
```
Tutte le chiavi Stripe sono in **live mode**. Il prodotto Starter $9 è stato archiviato (inactive).

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

## 9) Open Risks (aggiornato 2026-03-31)

- **OAuth redirect URLs**: tutti i provider (Notion, Google, Slack, Discord, ClickUp, Trello) hanno ancora redirect URL localhost/staging. Vanno aggiornate a `https://repsbrief.com/api/auth/<provider>/callback` nelle rispettive app console. Senza questo le integrazioni OAuth non funzionano per gli utenti prod.
- **Reddit API**: in attesa approvazione. Lo scraper Reddit è disabilitato finché non arriva.
- **DNS propagazione**: A record `76.76.21.21` aggiunto su Hostinger — può richiedere fino a 24h.
- Queue mode feature-flagged (`WEBHOOK_DELIVERY_MODE=inline` in prod): ok per lancio, da valutare switch a `queue` con traffico crescente.
- `supabaseAdmin` fail-fast su production se `SUPABASE_SERVICE_ROLE_KEY` manca — chiave configurata su Vercel.
