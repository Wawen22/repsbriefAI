# RepsBrief — PROJECT_CONTEXT (Single Source of Truth)

Last update: 2026-09-01
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
  - [x] Lint/typecheck/test/build — tutto clean (2026-03-09)
  - [ ] P4.4 Observability hardening (Sentry + alerting) — backlog
  - [ ] P4.5 Publishing connectors (WordPress/Ghost) — backlog bassa priorità
  - [ ] P4.6 Cloud asset sync (Drive/Dropbox) — backlog bassa priorità
- [ ] **Phase 6: Revenue Launch** (In corso — 2026-08-30)
  - [x] Vercel deploy → https://repsbrief.com (GitHub CI/CD attivo)
  - [x] Stripe live mode: Pro $19/mo; Starter = Free
  - [x] Landing pricing/copy aligned to delivered Starter and Pro entitlements
  - [x] Trend-quality gate: no generated brief when active sources are empty, malformed, or stale
  - [x] Canonical public shares use `/s/[id]`; legacy `/share/[id]` redirects
  - [x] Referral customer credit has a Stripe idempotency key
  - [x] Stripe Node 20.3.1 API-version TypeScript blocker resolved by aligning the client literal to its generated API version (`2026-01-28.clover`); typecheck/test/lint pass (2026-09-01)
  - [ ] Resend domain verification + `RESEND_FROM_EMAIL` configured in Vercel
  - [ ] Supabase migration history reconciled before applying current migration set
  - [ ] Production smoke test: signup → Starter brief → Pro checkout → webhook → cancellation
  - [ ] First cohort: recruit 10 Fitness & Nutrition creators
  - [ ] Weekly funnel review: signup → brief → trial → paid

## 5) UI/UX Roadmap

| ID | Feature | Priorità | Stato |
|:---|:---|:---:|:---:|
| 13 | Guided Onboarding Tour | 🔴 High | ✅ Done |
| 14 | Trends Visualizer | 🟡 Medium | ⬜ Todo |
| 15 | Shareable Strategy Links (/s/[id]) | 🟡 Medium | ✅ Canonical route live; DB policy pending migration reconciliation |
| 16 | Custom Theme Accents | 🟢 Low | ⬜ Todo |
| 17 | Email Capture (Landing Hero) + Welcome Email | 🔴 High | 🟡 Lead capture live; sending domain pending |
| 18 | Idea Gate — Starter sees 5/20 ideas | 🔴 High | ✅ Done |
| 19 | Social Proof bar on Landing | 🔴 High | ✅ Removed: no verified social proof yet |
| 20 | Rate Limit: Starter 1/week, Pro 1/day | 🔴 High | ✅ Done |
| 21 | Analytics Day-1 Insights (brief stats) | 🟡 Medium | 🔵 Planned |
| 22 | Day 3 + Day 7 Re-engagement Emails | 🟡 Medium | 🔵 Planned |

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

## 7) Validation Snapshot (2026-08-30)

- [x] `npm run typecheck` passes.
- [x] `npm run test` passes (38 tests); `npm run test:e2e` passes.
- [x] `npm run lint` passes.
- [x] `npm run build` passes with non-secret local placeholder environment values (the production environment supplies real values).

## Task Status Tracking

- [x] Stripe Node 20.3.1 TypeScript blocker resolved without changing Stripe package versions, pricing IDs, webhook behavior, or migrations; test, typecheck, lint, and a placeholder-environment build pass (2026-09-01).

## 8) DB / Migrations

**Do not apply migrations blindly.** Production migration history still contains only six records while the repository contains a much longer migration chain. The independently verified hardening migration `20260830095438_harden_revenue_launch_access.sql` is applied; reconcile the older history before applying any remaining local migrations.

Variabili env richieste per prod: vedere `INTEGRATIONS_CHECKLIST.md`.

## 9) Open Risks (aggiornato 2026-08-30)

- **Email**: Resend returned production delivery errors because no verified sender domain was configured. Lead persistence is safe; invitation delivery needs the manual DNS/domain step.
- **Source reliability**: recent Reddit 403, Google Trends parsing failures, and RSS 429/404 exist. The initial beta enables only its configured source set and rejects bad source data rather than inventing a brief.
- **Billing**: Stripe live mode has no active subscriptions yet. Validate the full webhook cycle with a live test checkout before acquisition.
- **Data security**: anonymous `shared_strategies` reads and public queue-claim execution were hardened in production on 2026-08-30. Older remote migration history remains incomplete and must be reconciled before further schema work.
- Queue mode feature-flagged (`WEBHOOK_DELIVERY_MODE=inline` in prod): ok per lancio, da valutare switch a `queue` con traffico crescente.
- `supabaseAdmin` fail-fast su production se `SUPABASE_SERVICE_ROLE_KEY` manca — chiave configurata su Vercel.
- Security/cost controls (2026-09-01): AI Remix, Brand Voice e image generation richiedono `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` per rate limiting distribuito; senza configurazione rispondono fail-closed. Nessuna migration Supabase è stata applicata.
- Image provider safety (2026-09-01): i download remoti HTTPS sono disabilitati fail-closed per evitare DNS rebinding; sono accettati solo data URL raster PNG/JPEG/WebP fino a 10 MiB. Follow-up obbligatorio: trasporto HTTP Node con DNS pinning verificabile prima di riabilitare URL remoti.
