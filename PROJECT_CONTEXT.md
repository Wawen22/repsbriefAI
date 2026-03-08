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
  - [ ] Discord notification channel pre-formattato

## 5) Task Status Tracking

- [x] **Current Task (completed):** OAuth-first blueprint integrazioni + migrazione `middleware -> proxy` (2026-03-07)
- [ ] **Next Task:** Implementazione Discord OAuth-first (start/callback/actions + Settings UX + test send)

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

## 6) Validation Snapshot (2026-03-07)

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `npm run lint` passes con `0 errors`, `0 warnings`.

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

## 8) Open Risks & Notes

- Migration logs alignment applicata sull'ambiente corrente; se manca su altri ambienti (staging/prod), i log webhook possono fallire per vincolo `integration_id NOT NULL`.
- Se la migration `add_channel_to_team_webhooks` non e' applicata in staging/prod, la creazione canali Slack fallisce (`column channel does not exist`).
- Setup Slack via webhook funziona ma ha frizione per utenti non tecnici; prioritario introdurre OAuth Slack con UX guidata.
- Slack OAuth richiede configurazione Redirect URL corretta in Slack App (`/api/auth/slack/callback`) su ogni ambiente.
- Le chiavi Slack condivise durante setup vanno ruotate dopo il test (igiene segreti).
- `supabaseAdmin` ora fa fallback su anon key se `SUPABASE_SERVICE_ROLE_KEY` manca: evita errori runtime/TS ma può ridurre privilegi nei path admin/cron.

## 9) Immediate Execution Plan

1. Verificare migration Supabase anche su staging/production (se non già allineati).
2. Validare Slack end-to-end su workspace reale (aggiunta webhook, test, evento reale, log Automation).
3. Implementare Discord OAuth-first seguendo blueprint (`start`, `callback`, persist token team-level, logs).
4. Integrare reconnect/disconnect/test send in Settings per Discord.
5. Validare end-to-end su workspace reale + controllo log automazioni.
