# Apify Trend Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ingerire quattro fonti trend in modo asincrono, verificabile e resiliente, senza scraping durante la generazione di un brief.

**Architecture:** Una coda orchestra adapter per YouTube, RSS, Reddit e Google Trends. Le run e i segnali normalizzati sono persistiti, deduplicati e composti in snapshot; soltanto uno snapshot che supera il quality gate alimenta cache e brief.

**Tech Stack:** Next.js route handlers, TypeScript, Supabase Postgres/RLS, Zod, job queue esistente, Apify REST/Task webhook.

**Spec:** `docs/superpowers/specs/2026-09-02-apify-trend-resilience-design.md`

## Global Constraints

- Nessun SDK AI fuori `src/lib/ai/providers/`; questo lavoro non introduce chiamate AI.
- Nicchie, Task id e fonti abilitate restano centralizzati in `src/config/niches.ts`.
- `APIFY_TOKEN` e webhook secret sono server-only; nessun valore segreto in codice o log.
- Non applicare migration, `migration repair` o Actor a pagamento senza autorizzazione esplicita.
- Reddit/Google Trends restano feature-flagged e fuori dalla copy pubblica fino al rollout approvato.

---

### Task 1: Contratti di trend e configurazione feature-flag

**Files:** Create `src/lib/trends/contracts.ts`; modify `src/types/niche.ts`, `src/config/niches.ts`; test `tests/unit/trend-contracts.test.ts`.

**Produces:** `TrendSource`, `NormalizedTrendSignal`, `TrendSnapshot`, `TrendSourceRun` e configurazione `TREND_SOURCE_CONFIG` per fonte/nicchia.

- [x] Scrivere test fallenti per campi obbligatori, fonti consentite e URL HTTPS.
- [x] Eseguire `pnpm test tests/unit/trend-contracts.test.ts`; fallimento verificato per modulo assente.
- [x] Implementare il contratto:

```ts
export type TrendSource = 'youtube' | 'rss' | 'reddit' | 'google-trends'
export type NormalizedTrendSignal = { source: TrendSource; externalId: string; title: string; canonicalUrl: string; publishedAt: string; observedAt: string; provenance: Record<string, string>; content?: string; score?: number; metadata?: Record<string, unknown> }
```

- [x] Aggiungere config per Task Apify opzionali e flag `enabled: false` per Reddit/Google Trends.
- [x] Rieseguire test focalizzato; commit `feat: add trend ingestion contracts`.

### Task 2: Schema persistente e repository

**Files:** Create `supabase/migrations/<timestamp>_add_trend_ingestion.sql`, `src/lib/trends/repository.ts`; test `tests/unit/trend-repository.test.ts`.

**Consumes:** contratti Task 1. **Produces:** repository `recordSourceRun`, `upsertSignals`, `createSnapshot`, `getLatestValidSnapshot`.

- [x] Scrivere test per chiavi `source+external_id`, URL e hash, idempotenza `provider_run_id`, snapshot scaduto.
- [x] Creare migration non applicata con `trend_source_runs`, `trend_signals`, `trend_snapshots`, `brief_trend_evidence`, indici unici e RLS team-safe.
- [x] Implementare repository server-only con query parametrizzate e errori sanitizzati.
- [x] Verificare test; commit `feat: persist trend runs and evidence`.

### Task 3: Adapter e validazione dataset

**Files:** Create `src/lib/trends/adapters/{types,youtube,rss,apifyReddit,apifyGoogleTrends,index}.ts`; tests `tests/unit/trend-adapters.test.ts`.

**Produces:** `adapt(source, input, context): NormalizedTrendSignal[]`.

- [ ] Aggiungere fixture valide, duplicate, URL HTTP, timestamp invalido e output Apify malformato.
- [ ] Implementare adapter puri con Zod; scartare record invalidi senza abortire record sani.
- [ ] Per Apify, leggere Task id/token esclusivamente nel chiamante server-side e portare in provenance solo id pubblici.
- [ ] Eseguire test; commit `feat: normalize native and Apify trend sources`.

### Task 4: Worker ingestion, retry e webhook

**Files:** Create `src/lib/trends/ingestionWorker.ts`, `src/app/api/cron/trend-ingestion/route.ts`, `src/app/api/webhooks/apify/route.ts`; modify `src/lib/jobs/*`; tests `tests/unit/trend-ingestion-worker.test.ts`, `tests/e2e/routes-smoke.test.ts`.

**Consumes:** Task 1-3. **Produces:** job `trend-ingest` e run idempotente.

- [ ] Testare dedupe key `trend-ingest:<source>:<niche>:<UTC-hour>`, backoff 5/15/45 minuti, dead letter per 401/403/schema e circuit breaker 3 fallimenti/24h.
- [ ] Implementare scheduling di tutte le fonti configurate, con un job separato per fonte/nicchia.
- [ ] Implementare chiamata asincrona Task Apify, verifica webhook constant-time e polling di recovery.
- [ ] Registrare durata, conteggio, costo quando disponibile e errore privo di segreti.
- [ ] Eseguire test; commit `feat: run resilient asynchronous trend ingestion`.

### Task 5: Snapshot, gate e generazione cache-only

**Files:** Modify `src/lib/trends/quality.ts`, `src/app/api/scraper/index.ts`, `src/app/api/generator/generate-now/route.ts`, `src/app/api/cron/weeklyBrief/route.ts`; create `src/lib/trends/snapshots.ts`; tests `tests/unit/trend-quality.test.ts`, `tests/e2e/routes-smoke.test.ts`.

**Produces:** gate con 12 segnali, 2 fonti sane, una nativa, 72h freshness e 14 giorni max age.

- [ ] Scrivere test per fallback nativo, una sola fonte, snapshot 73h, Apify down e cache assente.
- [ ] Materializzare `trends_cache` solo da snapshot valido e conservare evidenza brief-segnale.
- [ ] Rimuovere `scrapeNiche()` dalla request `generate-now`; risposta `503` con `Retry-After` se manca snapshot valido.
- [ ] Mantenere compatibilita del cron: pianifica/legge ingestion, non esegue scraper inline.
- [ ] Eseguire test; commit `feat: generate briefs from verified trend snapshots`.

### Task 6: Osservabilita, flag e rollout

**Files:** Modify `src/config/niches.ts`, `.env.example`, `docs/runbooks/production-smoke-test.md`, `PROJECT_CONTEXT.md`, `INIT_PROMPT.md`; create `docs/runbooks/apify-trend-rollout.md`; tests `tests/unit/niches.test.ts`.

- [ ] Testare che Reddit/Google Trends siano disabilitate per default e non entrino nel gate prima del flag.
- [ ] Documentare `APIFY_TOKEN`, `APIFY_WEBHOOK_SECRET`, Task id e `TREND_APIFY_DAILY_BUDGET_USD` senza valori.
- [ ] Documentare benchmark autorizzato, soglie di costo, osservazione sette giorni, rollback flag e nessuna modifica copy prima dell'esito.
- [ ] Eseguire test; commit `docs: add Apify rollout controls`.

### Task 7: Validazione release

**Files:** tutti i file delle task precedenti.

- [ ] Eseguire `pnpm run typecheck`.
- [ ] Eseguire `pnpm run lint`.
- [ ] Eseguire `pnpm test`.
- [ ] Eseguire build con placeholder non segreti.
- [ ] Eseguire smoke test solo dopo autorizzazione; escludere checkout, addebiti, cancellazioni e webhook Stripe live.
- [ ] Aggiornare checklist, commento Orca e preparare review prima del merge.
