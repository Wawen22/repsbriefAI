# RepsBrief — PROJECT_CONTEXT (Single Source of Truth)

Last update: 2026-09-02
Owner context: AI agents + team dev

## Operational status — 2026-09-02

- Git: `main` is clean and aligned with `origin/main` at `ff6c6a1` (`merge: redesign studio command center`). The production deployment is `READY` on this commit; no runtime errors were reported in the preceding 24 hours.
- Validation baseline: `pnpm run typecheck`, `pnpm run lint`, and `pnpm test` passed (17 files / 80 tests) before this operational session.
- Orca hygiene: `feat-public-design-system`, `feat-public-design-system-2`, and `feat-studio-command-center` are marked `completed`; their clean checkouts remain preserved for audit/rollback.
- Apify trend resilience: direzione a quattro fonti approvata (YouTube, RSS, Reddit e Google Trends); spec in `docs/superpowers/specs/2026-09-02-apify-trend-resilience-design.md`. Task 1–6 completati localmente: contratti Zod/config feature-flag fail-closed, persistenza, adapter, worker asincrono, snapshot cache-only e runbook di rollout. Il gate richiede 12 segnali, due fonti sane, almeno una nativa e segnali entro 72 ore; snapshot scaduti o oltre 14 giorni non materializzano cache. `generate-now` restituisce `503` retryable senza cache verificata; `weeklyBrief` materializza snapshot senza scraping inline. Reddit/Google Trends restano disabilitate finché i flag server-side non sono esplicitamente `true` e un budget positivo e configurato; prima di ogni run il worker somma `cost_usd` noto del giorno UTC e blocca nuove chiamate Apify al raggiungimento o se il totale non e disponibile. Nessun Actor o secret è stato usato in questo task.
- Resend/Vercel audit: `RESEND_FROM_EMAIL` remains a production blocker. The installed code fails closed for production mail when it is absent. The local Vercel CLI credential is invalid, so remote environment-name and deployment inspection requires a refreshed Vercel login/token; no secret values were requested or exposed.
- Safe production smoke plan is documented in `docs/runbooks/production-smoke-test.md`. It deliberately excludes live checkout creation, payment, cancellation, and webhook delivery until explicitly authorized.

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
- DB/Auth/Storage: Supabase (Project `qptnloozpjvcqqrfbmnj`, `eu-west-1`).
- Billing: Stripe (launch: `starter` free, `pro` monthly; Team is held back pending validation).
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
  - [x] Lint/typecheck/test/build — tutto clean (2026-09-02; 17 test file / 80 test)
  - [ ] P4.4 Observability hardening (Sentry + alerting) — backlog
  - [ ] P4.5 Publishing connectors (WordPress/Ghost) — backlog bassa priorità
  - [ ] P4.6 Cloud asset sync (Drive/Dropbox) — backlog bassa priorità
- [ ] **Phase 6: Revenue Launch** (In corso — 2026-09-01)
  - [x] Vercel deploy → https://repsbrief.com (GitHub CI/CD attivo)
  - [x] Stripe live mode: Pro $19/mo; Starter = Free
  - [x] Landing pricing/copy aligned to delivered Starter and Pro entitlements
  - [x] Trend-quality gate: no generated brief when active sources are empty, malformed, or stale
  - [x] Canonical public shares use `/s/[id]`; legacy `/share/[id]` redirects
  - [x] Referral customer credit has a Stripe idempotency key
  - [x] Pnpm is the canonical deployment package manager; its lock resolves Stripe 20.3.1, whose generated API type accepts the retained `2026-01-28.clover` client literal. The conflicting npm lockfile was removed, fixing the Vercel TypeScript deployment failure (2026-09-01)
  - [x] Revenue truthfulness hardening: copy reflects active YouTube/RSS sources; public shares use `/s/[id]`; referral cookie uses a Route Handler
  - [x] Engagement mail no longer notifies Starter users from historical briefs
  - [x] Mail sender is centralized on `RESEND_FROM_EMAIL` and fails closed in production
  - [x] Supabase Baseline Reconciliation Audit completato (`docs/audits/2026-09-01-supabase-reconciliation-audit.md`)
  - [x] Landing Page Interactive Studio Showcase completato (4 tab interattive: Trend Radar, AI Strategy Generator, Neural Brand Voice, Multi-Channel Sync con live micro-interactions) (2026-09-01)
  - [x] GitHub Actions CI allineato a pnpm (`pnpm install --frozen-lockfile` con placeholder env per build) (2026-09-01)
  - [ ] Reconcile Supabase production history only from a confirmed backup, then apply the authorized Delta DDL (`teams.brand_voice`, `idea_images`) and align `schema_migrations`
  - [ ] Resend domain verification + `RESEND_FROM_EMAIL` configured in Vercel
  - [ ] Production smoke test: signup → Starter brief → gating → idee/calendario; checkout Stripe/webhook only after explicit authorization
  - [ ] First cohort: recruit 10 Fitness & Nutrition creators
  - [ ] Weekly funnel review: signup → brief → trial → paid
  - [x] Spec Apify trend resilience approvata: quattro fonti, ingestion asincrona, provenance e fallback
  - [x] Spec Apify revisionata e approvata; piano dettagliato in `docs/superpowers/plans/2026-09-02-apify-trend-resilience.md`
  - [x] Task 1 Apify: contratti trend runtime e configurazione feature-flag centralizzata, con test RED/GREEN
  - [x] Task 2 Apify: migration non applicata e repository, con RLS team-safe per evidence e test RED/GREEN
  - [x] Task 3 Apify: adapter Zod puri per YouTube/RSS/Reddit/Google Trends con fixture di record validi, duplicati e malformati; nessun token o chiamata remota
  - [x] Task 5 Apify: brief generati da cache/snapshot verificati ora persistono evidence team-scoped verso ogni segnale dello snapshot; nessun servizio esterno invocato
  - [x] Task 6 Apify: flag server-side fail-closed, validazione budget positiva e runbook per benchmark autorizzato, osservazione sette giorni e rollback
  - [x] Release gate Apify: corretto il mock tipizzato del repository (`order`/`limit` ora preservano `gte`/`lt`); typecheck, lint, 24 file / 117 test e build placeholder verdi nel worktree.

## 5) UI/UX Roadmap

| ID | Feature | Priorità | Stato |
|:---|:---|:---:|:---:|
| 13 | Guided Onboarding Tour | 🔴 High | ✅ Done |
| 14 | Trends Visualizer | 🟡 Medium | ⬜ Todo |
| 15 | Shareable Strategy Links (/s/[id]) | 🟡 Medium | ✅ Canonical route live; DB policy verified |
| 16 | Custom Theme Accents | 🟢 Low | ⬜ Todo |
| 17 | Email Capture (Landing Hero) + Welcome Email | 🔴 High | 🟡 Lead capture live; sending domain pending |
| 18 | Idea Gate — Starter sees 5/20 ideas | 🔴 High | ✅ Done |
| 19 | Social Proof bar on Landing | 🔴 High | ✅ Removed: no verified social proof yet |
| 20 | Rate Limit: Starter 1/week, Pro 1/day | 🔴 High | ✅ Done |
| 21 | Analytics Day-1 Insights (brief stats) | 🟡 Medium | 🔵 Planned |
| 22 | Day 3 + Day 7 Re-engagement Emails | 🟡 Medium | 🔵 Planned |
| 23 | Studio Command Center | 🔴 High | ✅ Done — single decision surface, workflow rail, evidence inventory |

UI/UX completate: 1-12 (Generazione Immersiva, Kanban, AI Remix, Brand Voice, Timeline, Teleprompter, ecc.)

**Plan:** `docs/superpowers/plans/2026-08-30-revenue-relaunch.md`

## 6) Billing Config (Live — 2026-03-31)

Piani: `starter` (free) | `pro` ($19/mo) | `team` ($39/mo)

```
STRIPE_PRICE_PRO_MONTHLY=price_1TH3ecQ8w32NjQAk0KMEetVv
STRIPE_PRICE_TEAM_MONTHLY=price_1TH3ecQ8w32NjQAkpJYZtYq9
Webhook endpoint: https://repsbrief.com/api/stripe/webhook
```
Tutte le chiavi Stripe sono in **live mode**. Il prodotto Starter $9 è stato archiviato (inactive).

- [x] UI/UX Design Unification (2026-09-01): Completely refactored internal application interface to match Landing Page Dark IDE Studio aesthetic (#000000, hairline borders border-white/[0.08], monospace metadata chips, Linear/Vercel polish across app shell, sidebar, dashboard, brief cards, studio view, kanban, history, analytics, and settings).
- [x] Public Studio Design System (2026-09-01): extended the Dark IDE Studio shell and primitives to authentication, password recovery, invitations, canonical public shares, and legal pages; preserved all Supabase, Server Action, metadata, and route behaviour.
- [x] Pnpm 11.25.0 is declared in `package.json` and is the sole deployment package manager; `package-lock.json` was removed to prevent npm/pnpm resolution drift.
- [x] `pnpm-lock.yaml` retains `stripe: ^20.3.1` in the manifest but pins its direct resolution to 20.3.1. The installed generated `ApiVersion` is exactly `2026-01-28.clover`, matching `src/lib/stripe.ts` and fixing Vercel's TypeScript failure.
- [x] `pnpm install --frozen-lockfile` passed; explicit pnpm 11 build-policy decisions deny pending third-party lifecycle scripts without changing dependency versions.
- [x] `pnpm test` passed: 17 files, 80 tests; `pnpm run typecheck` and `pnpm run lint` passed (0 errors, 0 warnings) (2026-09-02).
- [x] `pnpm run build` passed with harmless Supabase, Stripe, Resend, OpenAI, and app-URL placeholders.
- [x] Studio Command Center redesign: dashboard now provides one data-backed decision canvas, active-brief-only workflow completion, source/format evidence, inventory navigation, and a safe calendar path without simulated momentum (2026-09-01).

## 8) DB / Migrations & Reconciliation Baseline

**Audit Document:** `docs/audits/2026-09-01-supabase-reconciliation-audit.md`  
**Test Suite:** `supabase/tests/2026-09-01-reconciliation-verification.sql`  

- **Stato Remoto (Project `qptnloozpjvcqqrfbmnj`):** 15 tabelle presenti, 6 record in `supabase_migrations.schema_migrations`.
- **Divergenze Rilevate:**
  - `public.idea_images` e bucket `idea-images` mancanti in produzione.
  - `public.teams` manca di `brand_voice` (TEXT) e `writing_samples` (TEXT[]), rendendo `update_team_brand_voice` non invocabile.
- **Regola:** creare e verificare un backup di produzione prima della riconciliazione. **NON applicare migration cieche né eseguire `migration repair` senza autorizzazione esplicita.** Seguire la sequenza Delta DDL documentata nell'audit.

Variabili env richieste per prod: vedere `INTEGRATIONS_CHECKLIST.md`.

## 9) Open Risks (aggiornato 2026-09-01)

- **Database**: `teams.brand_voice` e `idea_images` mancano su remoto; `schema_migrations` traccia solo 6 versioni su 38. Create and verify a production backup before the reconciliation, which also requires explicit authorization to apply.
- **Security / Functions**: `claim_queue_jobs` ha `SECURITY DEFINER` con `search_path = public` (permessi già ristretti a service_role); resta da hardenare a `search_path = ''`.
- **Email**: Resend ha generato errori di delivery per mancanza di dominio mittente verificato (`RESEND_FROM_EMAIL`). Richiede passaggio manuale DNS.
- **Source reliability**: YouTube e RSS sono le uniche fonti attive; Examine ha restituito 429 e RP/T-Nation 404. La pipeline asincrona a quattro fonti è definita nel worktree `feat-apify-trend-resilience`; i brief team-scoped conservano ora provenance snapshot→segnale. Reddit/Google Trends restano disabilitati fino a benchmark e rollout autorizzati.
- **Billing**: Stripe live mode attivo ma senza abbonamenti reali. Validare ciclo webhook completo prima dell'acquisizione coorte.
- Queue mode feature-flagged (`WEBHOOK_DELIVERY_MODE=inline` in prod): ok per lancio, da valutare switch a `queue` con traffico crescente.
- `supabaseAdmin` fail-fast su production se `SUPABASE_SERVICE_ROLE_KEY` manca — chiave configurata su Vercel.
- Security/cost controls (2026-09-01): AI Remix, Brand Voice e image generation richiedono `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` per rate limiting distribuito; senza configurazione rispondono fail-closed. Nessuna migration Supabase è stata applicata.
- Image provider safety (2026-09-01): i download remoti HTTPS sono disabilitati fail-closed per evitare DNS rebinding; sono accettati solo data URL raster PNG/JPEG/WebP fino a 10 MiB. Follow-up obbligatorio: trasporto HTTP Node con DNS pinning verificabile prima di riabilitare URL remoti.
- Dependency integrity (2026-09-01): pnpm is canonical and locked to Stripe 20.3.1 so its generated API type remains aligned with the pinned client literal. Pnpm 11.25.0 explicitly denies unapproved lifecycle scripts for `@sentry/cli`, `core-js`, `msw`, `sharp`, and `unrs-resolver`; review and explicitly approve only required scripts in a separately authorized dependency-security task if future builds need them.
