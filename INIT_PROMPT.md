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

- [x] `main` pulito e allineato a `origin/main` su `5755e6d`; deploy Vercel production `READY` sullo stesso commit; nessun runtime error nelle ultime 24 ore.
- [x] Suite baseline: `pnpm run typecheck`, `pnpm run lint`, `pnpm test` — 17 file / 80 test verdi.
- [x] Worktree Orca `feat-public-design-system`, `feat-public-design-system-2` e `feat-studio-command-center` marcati `completed` e preservati puliti per audit/rollback.
- [x] Worktree Orca isolato `feat-apify-trend-resilience` aperto da `49c1062` per ingestion asincrona Apify, deduplica, provenance e fallback; nessuna implementazione ancora avviata.
- [x] Piano smoke production sicuro documentato in `docs/runbooks/production-smoke-test.md`; checkout live, addebito, cancellazione e webhook reale rimangono esclusi senza autorizzazione esplicita.
- [x] Audit read-only Vercel via MCP: deploy `5755e6d` `READY`, nessun runtime error nelle ultime 24 ore.
- [x] Su richiesta esplicita, dominio mittente Resend `repsbrief.com` non verificato rimosso e ricreato in EU West (ID `1a072d64-21f1-420c-b5c6-49c7c1167693`); DNS autorevole aggiornato al nuovo DKIM, MX/SPF `verified`. Nessun altro dominio rimosso.
- [ ] Attendere la scadenza della cache Resend del vecchio DKIM (TTL precedente 14400), poi riavviare la verifica; a stato `verified`, configurare `RESEND_FROM_EMAIL` in Vercel Production.
- [ ] Riavviare Codex con `APIFY_TOKEN` disponibile nell'ambiente: l'MCP Apify è registrato globalmente; OAuth Codex non avvia il browser per incompatibilità dell'endpoint.
- [x] Namecheap MCP registrato globalmente in Codex come endpoint Streamable HTTP (`https://mcp.namecheap.com/mcp`). Il login OAuth è bloccato prima del browser: Codex rifiuta i metadati perché l'origine dell'issuer non coincide con quella dell'authorization server.

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
  - [ ] Worktree `feat/apify-trend-ingestion`: pipeline asincrona trend
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
| **feat-apify-trend-resilience** | 🟡 **In progress** | Senior Full-Stack / 🟡 P1 | Worktree isolato aperto da `49c1062`: progettare ingestion asincrona Apify, adapter normalizzati, deduplica, provenance e fallback YouTube/RSS. |
| **Resend Sender Domain** | ⬜ In attesa | DevOps / 🔴 P0 | Configurazione DNS e variabile `RESEND_FROM_EMAIL` su Vercel. |
| **Namecheap MCP** | 🟡 **Registrato / OAuth bloccato** | DevOps / 🟡 P1 | Endpoint remoto attivo in Codex; il login OAuth Namecheap è respinto dal controllo di origine dei metadati Codex prima dell'apertura del browser. |
| **Supabase Remote DDL Apply** | ⏸️ **Bloccato** | Team Dev / 🔴 P0 | Create and verify a production backup, then obtain explicit authorization before executing Delta DDL or aligning `schema_migrations`. |
| **Release Validation** | ✅ **Verified + deployed** | Senior Full-Stack / 🔴 P0 | `pnpm run typecheck`, `pnpm run lint`, and `pnpm test` passed (17 test files / 80 tests); Vercel production is `READY` on `ff6c6a1`. |

---

## 5. Protocollo Operativo per Agenti AI

1. **Research:** Leggere integralmente `PROJECT_CONTEXT.md`, `INIT_PROMPT.md` e la documentazione rilevante prima di qualsiasi modifica.
2. **Strategy:** Elaborare e comunicare la strategia prima di scrivere codice.
3. **Execution:** Modifiche chirurgiche, TypeScript-only, rispettando l'AI Abstraction e la centralizzazione nicchie.
4. **Validation:** Eseguire sempre `npm run typecheck`, `npm run test`, `npm run lint` e `npm run build`.
5. **State Maintenance:** Aggiornare le checklist in `INIT_PROMPT.md` e `PROJECT_CONTEXT.md` al termine di ogni sessione.
