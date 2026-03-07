# RepsBrief — PROJECT_CONTEXT (Single Source of Truth)

Last update: 2026-03-07
Owner context: AI agents + team dev

## 1) Product Scope

RepsBrief è una web app `Next.js + Supabase` per generare, organizzare e distribuire strategie contenuto basate su trend reali (scraper + AI), con workspace multi-team, calendario editoriale e integrazioni esterne.

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
- Billing: Stripe.
- Mail: Resend.
- Integrations: Notion, Google Calendar, Webhooks (Zapier/Make/custom endpoints).

## 4) Development Progress (Merged from INIT_PROMPT)

- [x] **Phase 1: Foundation** (Completata)
- [x] **Phase 2: Scrapers & Generator** (Completata)
- [x] **Phase 3: Automation & Delivery** (Completata)
- [x] **Phase 4: UI/UX** (Completata)
- [ ] **Phase 5: Integrazioni & Ecosystem** (In corso)
  - [x] Notion Integration (OAuth + export strategie)
  - [x] Google Calendar (OAuth + sync + bulk sync)
  - [x] Webhooks/Zapier engine (HMAC signed)
  - [x] Settings UX integrazioni (stato webhook reale)
  - [x] App Health Audit baseline (build/lint/typecheck)
  - [x] Build stabilization (TypeScript/build bloccanti risolti)
  - [x] Automation Logs UI (tab Settings + filtri + storico eventi)
  - [x] Integration Logs schema alignment (migration dedicata)
  - [ ] Lint stabilization completa (debt ancora aperto)
  - [ ] Slack/Discord notification channels pre-formattati

## 5) Task Status Tracking

- [x] **Current Task (completed):** Stabilizzazione build/typecheck + Automation Logs + schema logs alignment (2026-03-07)
- [ ] **Next Task:** Lint debt burn-down (prima wave: errori bloccanti) + Slack/Discord channels

### Completed Milestones

- [x] Initial Context & Prompt Review
- [x] Architectural Summarization
- [x] Project Scaffold & Folder Structure
- [x] GitHub Repo Synced
- [x] AI Abstraction Layer Implementation
- [x] Niche Configuration & Types Setup
- [x] Supabase Schema & Migration Creation
- [x] Scraper Orchestrator & Modules (Reddit, YouTube, Google Trends, RSS)
- [x] Brief Generator with AI abstraction + validation
- [x] Weekly Cron Job orchestration (scrape + generate + save)
- [x] Email integration
- [x] Stripe checkout + webhook
- [x] Dashboard + history + format filters
- [x] Niche picker + multi-format content display
- [x] Settings page tab refactor
- [x] Notion API integration
- [x] Google Calendar integration
- [x] Webhooks engine
- [x] Strategic Studio export (PDF/Markdown/integrations)
- [x] Integrations UX fix (connected status su webhook reali)
- [x] App Health Audit
- [x] TypeScript/build blocking fixes
- [x] Automation Logs UI (Settings)
- [x] Migration `team_integration_logs` alignment

## 6) Validation Snapshot (2026-03-07)

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [ ] `npm run lint` fails (`74 errors`, `125 warnings`): debt storico non ancora chiuso.

## 7) DB / Migrations Recenti

- Added: `supabase/migrations/20260307153000_align_team_integration_logs_schema.sql`
  - rende `integration_id` nullable in `team_integration_logs`
  - aggiunge `provider`, `action`, `status`
  - backfill provider/action/status su storico
  - indici per query UI logs

## 8) Open Risks & Notes

- Fino a quando la migration nuova non è applicata, i log webhook su DB legacy possono fallire per vincolo `integration_id NOT NULL`.
- Lint non verde: qualità statica parziale; build e typecheck però sono verdi.
- Il warning Next su convenzione `middleware -> proxy` resta aperto.

## 9) Immediate Execution Plan

1. Applicare migration Supabase in tutti gli ambienti.
2. Completare cleanup ESLint (soprattutto `no-explicit-any`, `require()` e rule React nuove).
3. Implementare Slack/Discord channels come integrazioni notifiche preconfigurate (riuso engine webhook).
