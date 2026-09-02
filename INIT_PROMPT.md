# RepsBrief — Project Initialization & Agent Protocols (INIT_PROMPT)

> **Document Version:** 1.0.0  
> **Last Updated:** 2026-09-02  
> **Target Environment:** Next.js (App Router), Supabase PostgreSQL, Stripe Live, Vercel, Resend  

---

## 1. Executive Summary & Core Mission

RepsBrief è una piattaforma SaaS multi-tenant (`Next.js + Supabase`) per creator, coach e agenzie di fitness/nutrizione, progettata per generare strategie di contenuto quotidiane e settimanali basate su trend reali con pipeline di scraping asincrono e intelligenza artificiale.

### 🛡️ Architectural Guardrails (Non-Negotiable)

1. **AI Abstraction Layer:** Ogni invocazione AI passa tassativamente dalla factory function `getAIProvider()` in `src/lib/ai/index.ts`. Nessun SDK AI (OpenAI, Anthropic, Gemini, Groq, Azure, OpenRouter) può essere importato fuori da `src/lib/ai/providers/`.
2. **Multi-Niche Centralization:** Tutti i dati e metadati specifici per nicchia (nomi, fonti RSS, keyword, canali YouTube) devono essere centralizzati in `src/config/niches.ts`. Mai hardcodare configurazioni altrove.
3. **TypeScript First:** 100% strict TypeScript. Nessun file `.js` non tipizzato per la logica di business.
4. **Team-First Data Model:** Accessi e autorizzazioni legati a `team_id` / `current_team_id` con Row Level Security (RLS) attiva.
5. **Database Governance:** Creare sempre migration versionate in `supabase/migrations/` con naming `YYYYMMDDHHMMSS_description.sql`. **Mai applicare migration a produzione o eseguire `migration repair` senza autorizzazione esplicita.**

---

## 2. Document Reference & Key Audits

- 📋 [AGENTS.md](AGENTS.md) — Protocolli, ruoli e workflow degli agenti AI.
- 📖 [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — Single Source of Truth sullo stato del progetto e dell'architettura.
- 🔍 [docs/audits/2026-09-01-repsbrief-audit.md](docs/audits/2026-09-01-repsbrief-audit.md) — Audit generale pre-lancio paid-beta e roadmap worktree ORCA ADE.
- 🗄️ [docs/audits/2026-09-01-supabase-reconciliation-audit.md](docs/audits/2026-09-01-supabase-reconciliation-audit.md) — Audit di riconciliazione tra le 38 migration del repository e i 6 record remoti su Supabase (`qptnloozpjvcqqrfbmnj`).
- 🧪 [supabase/tests/2026-09-01-reconciliation-verification.sql](supabase/tests/2026-09-01-reconciliation-verification.sql) — Suite di test statici SQL di validazione dello schema post-allineamento.

---

## 3. Development Progress

### Operational update — 2026-09-02

- [x] `main` pulito e allineato a `origin/main` su `ff6c6a1`; deploy Vercel production `READY` sullo stesso commit.
- [x] Suite baseline: `pnpm run typecheck`, `pnpm run lint`, `pnpm test` — 17 file / 80 test verdi.
- [x] Worktree Orca `feat-public-design-system`, `feat-public-design-system-2` e `feat-studio-command-center` marcati `completed` e preservati puliti per audit/rollback.
- [x] Piano smoke production sicuro documentato in `docs/runbooks/production-smoke-test.md`; checkout live, addebito, cancellazione e webhook reale rimangono esclusi senza autorizzazione esplicita.
- [x] Direzione Apify a quattro fonti approvata; spec di ingestion asincrona, provenance, deduplica, quality gate e fallback in `docs/superpowers/specs/2026-09-02-apify-trend-resilience-design.md`.
- [x] Spec Apify approvata e piano dettagliato disponibile in `docs/superpowers/plans/2026-09-02-apify-trend-resilience.md`.
- [x] Task 1 Apify completato: contratti Zod, tipi source run/snapshot e `TREND_SOURCE_CONFIG`; Reddit/Google Trends disabilitate per default e test RED/GREEN registrato.
- [x] Task 2 Apify completato localmente: migration versionata ma non applicata e repository trend; typecheck e 89 test verdi, lint completo inconclusivo per stall del runner (lint mirato verde). Actor a pagamento, secret Vercel e apply migration restano soggetti ad autorizzazione.
- [x] Task 3 Apify completato localmente: adapter Zod puri YouTube/RSS/Reddit/Google Trends, con fixture per record validi, duplicati, URL HTTP, timestamp invalidi e dataset Apify malformato. Nessun token, Actor, chiamata remota o migration eseguita; test adapter, typecheck e lint mirato verdi.
- [x] Task 4 Apify completato localmente: worker/scheduling orario idempotente, contratti retry/circuit breaker, start/poll server-side e webhook HMAC constant-time. Nessun Actor, token o chiamata remota eseguita; 8 test focalizzati verdi.
- [ ] Ripristinare una credenziale Vercel CLI valida per audit read-only di deployment/env-name; non leggere o stampare valori segreti.

- [x] **Phase 1: Foundation** (Completata)
- [x] **Phase 2: Scrapers & Generator** (Completata)
- [x] **Phase 3: Automation & Delivery** (Completata)
- [x] **Phase 4: UI/UX** (Completata)
- [ ] **Phase 5: Integrazioni & Ecosystem** (~95% completata)
  - [x] Notion, Google Calendar, Webhooks/Zapier (HMAC signed)
  - [x] Slack OAuth + notifications + hardening
  - [x] Discord OAuth + notifications
  - [x] ClickUp OAuth MVP
  - [x] Trello OAuth MVP
  - [x] Automation Logs UI
  - [x] Queue/Jobs spike (DB queue + retry/dead-letter)
  - [x] OAuth-first blueprint (tutti i provider)
  - [x] Lint/typecheck/test/build clean
  - [ ] P4.4 Observability hardening (Sentry + alerting) — backlog
  - [ ] P4.5 Publishing connectors (WordPress/Ghost) — backlog
  - [ ] P4.6 Cloud asset sync (Drive/Dropbox) — backlog
- [ ] **Phase 6: Revenue Launch & Paid Beta** (In corso)
  - [x] Vercel deploy → https://repsbrief.com (GitHub CI/CD attivo)
  - [x] Stripe live mode: Pro $19/mo; Starter = Free
  - [x] Landing pricing/copy allineati a Starter e Pro
  - [x] Trend-quality gate: blocco brief su fonti vuote/malformate/stale
  - [x] Canonical public shares `/s/[id]` con redirect da legacy `/share/[id]`
  - [x] Referral customer credit con idempotency key
  - [x] Pnpm is canonical for deployment: `pnpm-lock.yaml` pins Stripe 20.3.1, whose generated API type accepts the retained `2026-01-28.clover` client literal; the conflicting npm lockfile was removed, fixing Vercel TypeScript builds
  - [x] Revenue truthfulness integrated locally: active YouTube/RSS copy, canonical shares, and referral Route Handler
  - [x] Security/cost controls integrated locally: schemas, paid-plan gates, and fail-closed remote image policy
  - [x] **Supabase Baseline Reconciliation Audit** ([audit documentato](docs/audits/2026-09-01-supabase-reconciliation-audit.md))
  - [x] Local integration completed with ordered no-ff merges and pushed; no Supabase migration execution
  - [x] Completed pnpm-backed release validation: 80 tests, typecheck, lint, and a clean placeholder-backed build all pass. `package.json` declares pnpm 11.25.0; explicit pnpm build-policy decisions deny unapproved third-party lifecycle scripts.
  - [ ] Create and verify a production backup, then obtain authorization for the Delta DDL (`teams.brand_voice`, `idea_images`) and `schema_migrations` reconciliation
  - [ ] Resend domain verification + `RESEND_FROM_EMAIL` configurato in Vercel
  - [x] Worktree `feat-apify-trend-resilience`: Task 5 — snapshot verificati, gate qualità e brief cache-only
  - [ ] Production smoke test: signup → Starter brief → gating → idee/calendario; checkout Stripe/webhook only after explicit authorization
  - [ ] Reclutamento prima coorte: 10 creator Fitness & Nutrition

---

## 4. Task Status Tracking

| Task / Worktree | Stato | Owner / Priorità | Note |
| :--- | :---: | :---: | :--- |
| **integration-release-hardening** | ✅ **Integrated locally** | Senior Full-Stack / 🔴 P0 | Ordered no-ff integration of Stripe, security, revenue truthfulness, and audit branches; no push or migration execution. |
| **fix-pnpm-stripe-consistency** | ✅ **Verified locally** | Senior Full-Stack / 🔴 P0 | Pnpm is canonical; lock resolution is Stripe 20.3.1 and its generated `2026-01-28.clover` API type matches the preserved client literal, fixing Vercel TypeScript builds. |
| **fix/security-cost-controls** | ✅ **Integrated locally** | Senior Full-Stack / 🔴 P0 | Zod gates and rate limits integrated; remote images remain fail-closed (data URL raster only). |
| **fix/revenue-truthfulness** | ✅ **Integrated locally** | Senior Full-Stack / 🔴 P0 | Active-source copy, mail safeguards, `/s/[id]`, and `/r/[code]` Route Handler integrated. |
| **feat-landing-interactive-studio** | ✅ **Merged & Pushed** | Senior Full-Stack / 🔴 P0 | Interactive 4-tab ADE Studio Mockup (Radar, Generator, Brand Voice, Sync) with dynamic state & micro-interactions. |
| **feat-app-design-unification** | ✅ **Merged to main** | Senior Full-Stack / 🔴 P0 | Complete UI/UX refactor of dashboard, studio views, cards, kanban, history, analytics, settings to match landing Dark IDE aesthetic. |
| **feat-studio-command-center** | ✅ **Production / preserved** | Senior Full-Stack / 🔴 P0 | Redesign is live on `ff6c6a1`; clean Orca checkout preserved for audit/rollback. |
| **feat-public-design-system** | ✅ **Completed / preserved** | Senior Full-Stack / 🔴 P0 | Integrated in `main` (`ff6c6a1`); clean Orca checkout preserved for audit/rollback. |
| **feat-public-design-system-2** | ✅ **Completed / preserved** | Senior Full-Stack / 🔴 P0 | Integrated in `main` (`ff6c6a1`); clean Orca checkout preserved for audit/rollback. |
| **ci-pnpm-alignment** | ✅ **Merged & Pushed** | DevOps / 🔴 P0 | GitHub Actions CI updated to pnpm setup and build placeholders matching canonical deployment. |
| **feat-apify-trend-resilience** | 🟡 **Task 5 completato** | Senior Full-Stack / 🟡 P1 | Gate snapshot/cache-only validato; evidence brief-segnale, metriche run, rollout e release validation restano aperti. |
| **Resend Sender Domain** | ⬜ In attesa | DevOps / 🔴 P0 | Configurazione DNS e variabile `RESEND_FROM_EMAIL` su Vercel. |
| **Supabase Remote DDL Apply** | ⏸️ **Bloccato** | Team Dev / 🔴 P0 | Create and verify a production backup, then obtain explicit authorization before executing Delta DDL or aligning `schema_migrations`. |
| **Release Validation** | ✅ **Verified + deployed** | Senior Full-Stack / 🔴 P0 | `pnpm run typecheck`, `pnpm run lint`, and `pnpm test` passed (17 test files / 80 tests); Vercel production is `READY` on `ff6c6a1`. |

---

## 5. Protocollo Operativo per Agenti AI

1. **Research:** Leggere integralmente `PROJECT_CONTEXT.md`, `INIT_PROMPT.md` e la documentazione rilevante prima di qualsiasi modifica.
2. **Strategy:** Elaborare e comunicare la strategia prima di scrivere codice.
3. **Execution:** Modifiche chirurgiche, TypeScript-only, rispettando l'AI Abstraction e la centralizzazione nicchie.
4. **Validation:** Eseguire sempre `npm run typecheck`, `npm run test`, `npm run lint` e `npm run build`.
5. **State Maintenance:** Aggiornare le checklist in `INIT_PROMPT.md` e `PROJECT_CONTEXT.md` al termine di ogni sessione.
