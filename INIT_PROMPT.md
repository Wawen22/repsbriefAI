# RepsBrief — Project Initialization & Agent Protocols (INIT_PROMPT)

> **Document Version:** 1.0.0  
> **Last Updated:** 2026-09-01  
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
  - [x] Local integration completed with ordered no-ff merges; no push and no Supabase migration execution
  - [x] Completed pnpm-backed release validation: frozen install, 74 tests, typecheck, lint, and a clean placeholder-backed build all pass. `package.json` declares pnpm 11.25.0; explicit pnpm build-policy decisions deny unapproved third-party lifecycle scripts.
  - [ ] Create and verify a production backup, then obtain authorization for the Delta DDL (`teams.brand_voice`, `idea_images`) and `schema_migrations` reconciliation
  - [ ] Resend domain verification + `RESEND_FROM_EMAIL` configurato in Vercel
  - [ ] Worktree `feat/apify-trend-ingestion`: pipeline asincrona trend
  - [ ] Production smoke test: signup → Starter brief → Pro checkout → webhook → cancellation
  - [ ] Reclutamento prima coorte: 10 creator Fitness & Nutrition

---

## 4. Task Status Tracking

| Task / Worktree | Stato | Owner / Priorità | Note |
| :--- | :---: | :---: | :--- |
| **integration-release-hardening** | ✅ **Integrated locally** | Senior Full-Stack / 🔴 P0 | Ordered no-ff integration of Stripe, security, revenue truthfulness, and audit branches; no push or migration execution. |
| **fix-pnpm-stripe-consistency** | ✅ **Verified locally** | Senior Full-Stack / 🔴 P0 | Pnpm is canonical; lock resolution is Stripe 20.3.1 and its generated `2026-01-28.clover` API type matches the preserved client literal, fixing Vercel TypeScript builds. |
| **fix/security-cost-controls** | ✅ **Integrated locally** | Senior Full-Stack / 🔴 P0 | Zod gates and rate limits integrated; remote images remain fail-closed (data URL raster only). |
| **fix/revenue-truthfulness** | ✅ **Integrated locally** | Senior Full-Stack / 🔴 P0 | Active-source copy, mail safeguards, `/s/[id]`, and `/r/[code]` Route Handler integrated. |
| **chore/supabase-baseline-audit** | ✅ **Integrated locally** | Senior Full-Stack / 🔴 P0 | Audit and static SQL test suite only; neither was executed. |
| **feat/apify-trend-ingestion** | ⬜ In attesa | Senior Full-Stack / 🟡 P1 | Pipeline ingestion asincrona, adapter normalizzati, deduplica e provenance trend. |
| **Resend Sender Domain** | ⬜ In attesa | DevOps / 🔴 P0 | Configurazione DNS e variabile `RESEND_FROM_EMAIL` su Vercel. |
| **Supabase Remote DDL Apply** | ⏸️ **Bloccato** | Team Dev / 🔴 P0 | Create and verify a production backup, then obtain explicit authorization before executing Delta DDL or aligning `schema_migrations`. |
| **Release Validation** | ✅ **Verified locally** | Senior Full-Stack / 🔴 P0 | `pnpm install --frozen-lockfile`, 15 test files / 74 tests, typecheck, lint, and a clean placeholder-backed build pass. No dependency upgrades or audit remediation was run. |

---

## 5. Protocollo Operativo per Agenti AI

1. **Research:** Leggere integralmente `PROJECT_CONTEXT.md`, `INIT_PROMPT.md` e la documentazione rilevante prima di qualsiasi modifica.
2. **Strategy:** Elaborare e comunicare la strategia prima di scrivere codice.
3. **Execution:** Modifiche chirurgiche, TypeScript-only, rispettando l'AI Abstraction e la centralizzazione nicchie.
4. **Validation:** Eseguire sempre `npm run typecheck`, `npm run test`, `npm run lint` e `npm run build`.
5. **State Maintenance:** Aggiornare le checklist in `INIT_PROMPT.md` e `PROJECT_CONTEXT.md` al termine di ogni sessione.
