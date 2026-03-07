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
  - [x] Lint stabilization wave 1 (errori bloccanti risolti; warning debt aperto)
  - [x] Slack notification channel pre-formattato (riuso webhook engine + payload Slack blocks)
  - [ ] Discord notification channel pre-formattato

## 5) Task Status Tracking

- [x] **Current Task (completed):** Slack channel implementation (solo Slack) con migration + engine + UI + validazione (2026-03-07)
- [ ] **Next Task:** decisione roadmap su Discord + lint warning cleanup wave 2

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
- [x] ESLint error-level stabilization (`npm run lint` senza errori)
- [x] Billing CTA fix (`UserProfileMenu` apre Stripe Customer Portal)
- [x] Slack Notifications integration (Incoming Webhook + payload preformattato)

## 6) Validation Snapshot (2026-03-07)

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `npm run lint` passes con `0 errors`, `118 warnings` (warning debt aperto).

## 7) DB / Migrations Recenti

- Added: `supabase/migrations/20260307153000_align_team_integration_logs_schema.sql`
  - rende `integration_id` nullable in `team_integration_logs`
  - aggiunge `provider`, `action`, `status`
  - backfill provider/action/status su storico
  - indici per query UI logs
- Added: `supabase/migrations/20260307170000_add_channel_to_team_webhooks.sql`
  - aggiunge `channel` su `team_webhooks` (`generic` | `slack`)
  - backfill `generic` su record esistenti
  - check constraint e indice su `(team_id, channel, active)`

## 8) Open Risks & Notes

- Migration logs alignment applicata sull'ambiente corrente; se manca su altri ambienti (staging/prod), i log webhook possono fallire per vincolo `integration_id NOT NULL`.
- Se la migration `add_channel_to_team_webhooks` non e' applicata in staging/prod, la creazione canali Slack fallisce (`column channel does not exist`).
- Lint warning debt ancora aperto (`118` warning), soprattutto unused vars/import, `react-hooks/exhaustive-deps` e `no-img-element`.
- Il warning Next su convenzione `middleware -> proxy` resta aperto.
- `supabaseAdmin` ora fa fallback su anon key se `SUPABASE_SERVICE_ROLE_KEY` manca: evita errori runtime/TS ma può ridurre privilegi nei path admin/cron.

## 9) Immediate Execution Plan

1. Verificare migration Supabase anche su staging/production (se non già allineati).
2. Validare Slack end-to-end su workspace reale (aggiunta webhook, test, evento reale, log Automation).
3. Allineare roadmap Discord (specifiche payload/UX) prima di implementazione.
4. Eseguire lint warning cleanup wave 2 (`unused-vars`, `exhaustive-deps`, `no-img-element`).
