# RepsBrief — PROJECT_CONTEXT (Single Source of Truth)

Last update: 2026-03-09
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
- Integration UX direction: OAuth-first per servizi user-facing; webhook/manual setup solo fallback tecnico.

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
  - [x] Slack OAuth integration (login Slack no-code + webhook bootstrap automatico)
  - [x] Slack OAuth security hardening (`state` nonce cookie + start route server-side)
  - [x] Integrations/Webhooks hardening (RLS admin-only + guard server actions)
  - [x] Lint warning cleanup wave 2 (`0 warnings` on `npm run lint`)
  - [x] OAuth-first blueprint per integrazioni future (Discord incluso)
  - [x] Migrazione Next.js `middleware -> proxy`
  - [x] Discord notification channel pre-formattato (OAuth-first MVP)
  - [x] Hardening wave P0 (cron paid-plan filter + webhooks/logs runtime/RLS alignment)
  - [x] OAuth hardening wave Notion/Google (`/start` routes + nonce state + RBAC callback)
  - [x] `supabaseAdmin` fail-fast hardening su path admin/cron (production)
  - [x] P2 baseline test/CI (`vitest` unit+smoke + scripts `typecheck/test/test:e2e` + GitHub Actions CI)
  - [x] P2 maintainability refactor `IntegrationsSettings` (split componenti + hook team/webhooks)
  - [x] P3 dependency/security maintenance wave (`npm audit fix` + regression checks full pipeline)
  - [x] P4.1 Trello/ClickUp OAuth design spike (`TRELLO_CLICKUP_OAUTH_SPIKE.md`)
  - [x] P4.2 ClickUp OAuth MVP (`start/callback` + connect/disconnect/test + Settings UI)
  - [x] P4.2 Trello OAuth MVP (`start/callback` + connect/disconnect/test + Settings UI)
  - [x] Integrations Settings UX refinement (single-open panel + active card state + CTA readability)

## 5) Task Status Tracking

- [x] **Current Task (completed):** Integrations Settings UX refinement (2026-03-09)
- [ ] **Next Task:** P4.3 Queue/Jobs spike (`retry` + dead-letter per webhook/cron delivery)

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
- [x] Slack OAuth callback (`/api/auth/slack/callback`) con bootstrap webhook automatico
- [x] Slack OAuth redirect hardening (usa `NEXT_PUBLIC_APP_URL` per evitare mismatch http/https)
- [x] Slack OAuth mismatch fallback (authorize/token exchange senza `redirect_uri` esplicito)
- [x] Slack OAuth start route (`/api/auth/slack/start`) con nonce HttpOnly anti-CSRF
- [x] Webhook actions con role-check esplicito owner/admin
- [x] `INIT_PROMPT.md` restore (state tracking checklist riallineata)
- [x] Lint warning cleanup wave 2 (`npm run lint` con `0 warning`)
- [x] OAuth-first blueprint documentato (`INTEGRATIONS.md`)
- [x] Migrazione runtime routing da `src/middleware.ts` a `src/proxy.ts`
- [x] Discord OAuth start/callback (`/api/auth/discord/start`, `/api/auth/discord/callback`)
- [x] Discord webhook channel support (`team_webhooks.channel='discord'` + payload formatter)
- [x] Discord Settings UX (connect/manage/test/disconnect)
- [x] Project health audit #2 (security/runtime review + improvement backlog)
- [x] P0.1 cron paid-plan filter allineato a `ACTIVE_PAID_PLANS` (`pro/team`)
- [x] P0.2 trigger webhooks allineato a path admin + policy SQL `INSERT` su `team_integration_logs`
- [x] P1.1 hardening OAuth Notion/Google (start route server-side + nonce state cookie + RBAC callback)
- [x] P1.2 fail-fast `SUPABASE_SERVICE_ROLE_KEY` nei path critici (cron/scraper/generator/webhooks/stripe webhook)
- [x] P2 baseline quality gate (test suite + CI workflow)
- [x] P2 refactor UI integrations settings (componentizzazione + custom hook)
- [x] P3 security maintenance (`npm audit fix`) con regressioni assenti su lint/typecheck/test/build
- [x] TECHNICAL_FIXES_PLAN closeout con validazione completa (`lint`, `typecheck`, `test`, `test:e2e`, `build`, `npm audit`)
- [x] P4.1 Trello/ClickUp OAuth design spike (contract, mapping schema, security checks, implementation plan)
- [x] P4.2 ClickUp OAuth MVP (OAuth routes + actions + Settings panel + env/checklist updates)
- [x] P4.2 Trello OAuth MVP (OAuth1 routes + actions + Settings panel + smoke route coverage)
- [x] Integrations Settings UX refinement (single-open disclosure + active provider highlight + improved action labels)

## 6) Validation Snapshot (2026-03-09)

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `npm run lint` passes con `0 errors`, `0 warnings`.
- [x] `npm run test` passes.
- [x] `npm run test:e2e` passes.
- [x] `npm audit --audit-level=moderate` reports `0 vulnerabilities`.

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
- Added: `supabase/migrations/20260307183000_harden_integrations_webhooks_rls.sql`
  - rimuove lettura member-wide su `team_integrations`
  - impone policy admin-only su `team_integrations` e `team_webhooks`
  - aggiunge `WITH CHECK` esplicito per create/update sicuri
- Added: `supabase/migrations/20260308100000_add_discord_channel_to_team_webhooks.sql`
  - estende `team_webhooks_channel_check` a `discord`
  - mantiene indice `(team_id, channel, active)`
- Added: `supabase/migrations/20260308143000_add_insert_policy_team_integration_logs.sql`
  - aggiunge policy `INSERT` su `team_integration_logs` per owner/admin
  - riallinea observability logs con hardening RLS integrazioni

## 8) Open Risks & Notes

- Migration logs alignment applicata sull'ambiente corrente; se manca su altri ambienti (staging/prod), i log webhook possono fallire per vincolo `integration_id NOT NULL`.
- Se la migration `add_channel_to_team_webhooks` non e' applicata in staging/prod, la creazione canali Slack fallisce (`column channel does not exist`).
- Slack OAuth richiede configurazione Redirect URL corretta in Slack App (`/api/auth/slack/callback`) su ogni ambiente.
- Le chiavi Slack condivise durante setup vanno ruotate dopo il test (igiene segreti).
- Discord OAuth richiede configurazione Redirect URL corretta in Discord App (`/api/auth/discord/callback`) su ogni ambiente.
- Se la migration `20260308100000_add_discord_channel_to_team_webhooks` non è applicata in staging/prod, bootstrap Discord fallisce per constraint `team_webhooks_channel_check`.
- `supabaseAdmin` mantiene fallback anon solo fuori production; in production i path critici ora vanno in fail-fast se `SUPABASE_SERVICE_ROLE_KEY` manca.
- ClickUp OAuth MVP implementato; resta rollout checklist su staging/prod (redirect URI + env vars + smoke test).
- Trello OAuth MVP implementato; resta rollout checklist su staging/prod (callback URL + env vars + smoke test).
- Correzione applicata su callback ClickUp per errore `Oauth token not found` (token normalization + authorization fallback).

## 9) Immediate Execution Plan

1. Applicare migration `20260308143000_add_insert_policy_team_integration_logs.sql` su staging/production.
2. Eseguire smoke test manuale UI integrations (connect/manage/test/disconnect su generic/slack/discord) con verifica `Automation Logs`.
3. Eseguire smoke test ClickUp/Trello OAuth su staging/prod (connect/test/disconnect + Automation Logs).
4. Definire spike Queue/Jobs layer (`Inngest` o alternativa) per retry/dead-letter delivery webhook e cron tasks.
5. Agganciare observability stack (Sentry + alerting) sui path critici: OAuth callback, webhook delivery, cron weekly.
