# RepsBrief — P4.3 Queue/Jobs Spike

Last update: 2026-03-09
Owner: platform/backend

## 1) Problem

I path asincroni critici (`webhook delivery`, `cron weekly`) erano best-effort:
- nessun retry standardizzato,
- nessuna dead-letter queue,
- nessun worker dedicato per riprocessare failure transienti.

## 2) Decision Record (Spike)

Opzioni valutate:

1. `Inngest`
- Pro: DX alta, retry/observability built-in, cron/event workflows maturi.
- Contro: dipendenza esterna, costo/lock-in, integrazione progressiva da pianificare.

2. `QStash` (+ HTTP worker)
- Pro: semplice per queue HTTP-based, retry facile.
- Contro: dipendenza esterna, meno controllo DB-level su dedupe/stato locale.

3. `Postgres queue` (custom su Supabase, stile pgmq-lite) **[scelta spike]**
- Pro: nessuna dipendenza nuova, dati e stato nello stesso DB, rollout incrementale immediato.
- Contro: va gestita manualmente la worker lifecycle e observability avanzata.

Decisione spike:
- Implementare PoC con **queue Postgres locale** (`job_queue`, `job_dead_letters`) + worker route cron.
- Mantenere fallback `inline` come default per zero-regression.

## 3) Implementazione PoC

### Schema DB
- Migration: `supabase/migrations/20260309123000_add_job_queue_spike.sql`
- Tabelle:
  - `job_queue`: job `pending|processing|completed|dead`, attempts, scheduling, lock worker.
  - `job_dead_letters`: storico job esauriti.
- Funzione SQL:
  - `claim_queue_jobs(worker, limit, job_type)` con `FOR UPDATE SKIP LOCKED`.

### Runtime
- Nuova libreria: `src/lib/jobs/webhookQueue.ts`
  - dispatch policy (`inline` vs `queue`) via `WEBHOOK_DELIVERY_MODE`
  - enqueue con dedupe key opzionale
  - worker processing con retry exponential backoff e DLQ
  - fallback automatico a inline se enqueue fallisce
- Nuovo endpoint worker:
  - `POST /api/cron/webhook-queue`
  - auth: `Authorization: Bearer <CRON_SECRET>`

### Path collegati allo spike
- `approveIdeaAction` -> queue-aware dispatch
- `scheduleIdeaAction` -> queue-aware dispatch
- `weeklyBrief` cron -> queue-aware dispatch
- `generate-now` route -> queue-aware dispatch

## 4) Retry/Dead-Letter Policy

- `max_attempts`: default `5`
- backoff: `30s, 60s, 120s, ...` capped a `15m`
- condizione dead-letter:
  - payload invalido, oppure
  - `attempts >= max_attempts`
- outcome:
  - job -> `dead`
  - record su `job_dead_letters` con `last_error`

## 5) Configurazione

Env:
- `WEBHOOK_DELIVERY_MODE=inline|queue` (default: `inline`)
- `QUEUE_WORKER_BATCH_SIZE=20`

Worker invocation (manuale):
```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/webhook-queue?limit=20"
```

## 6) Rollout Graduale Consigliato

1. Stage: `WEBHOOK_DELIVERY_MODE=queue`, cron worker ogni 1 minuto.
2. Monitorare:
- crescita `job_queue` pending,
- error rate/retry,
- dead letters.
3. Prod: rollout progressivo (10% team -> 50% -> 100%).

## 7) Next Step (P4.4)

- Integrare alerting/monitoring:
  - soglia `pending backlog`,
  - soglia `dead-letter rate`,
  - correlazione errori per `team_id/provider/action`.
