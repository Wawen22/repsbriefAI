# Apify Trend Resilience — Design

## Decisione e obiettivo

RepsBrief adottera quattro fonti per la nicchia Fitness & Nutrition: YouTube
Data API e RSS come fonti native, Reddit e Google Trends/Search Trends tramite
Apify. L'obiettivo e eliminare lo scraping dalla request di generazione e usare
solo snapshot freschi, verificabili e citabili.

## Confini

Incluso: ingestion asincrona, adapter normalizzati, salute fonte, deduplica,
provenance, quality gate, fallback e osservabilita minima.

Escluso: avvio di Actor Apify a pagamento senza autorizzazione, applicazione di
migration Supabase, modifiche alla copy pubblica prima dell'attivazione delle
nuove fonti, Stripe e scraping nella request utente.

## Architettura

```text
cron di ingestion / webhook Apify
  -> job_queue (dedupe per fonte-nicchia-finestra)
  -> adapter della fonte
  -> source_runs (esito, tentativi, durata, costo noto, errore sanitizzato)
  -> trend_signals normalizzati con provenance immutabile
  -> trends_snapshot per nicchia
  -> quality gate
  -> generazione brief da snapshot valido
```

Il cron pianifica una run per fonte e nicchia. Gli adapter trasformano soltanto
l'output del provider nel contratto `NormalizedTrendSignal`; dati di nicchia
rimangono in `src/config/niches.ts`. La request di generazione legge l'ultimo
snapshot valido e non avvia mai scraper.

Le Task Apify sono preferite agli Actor invocati direttamente: l'input risiede
in Apify e l'app conserva solo un identificatore Task non segreto. La run e
asincrona; webhook firmato o polling ne elaborano il dataset. Il polling e il
fallback se il webhook non arriva nella finestra prevista.

## Contratti e persistenza proposta

Una migration futura, mai applicata senza backup e autorizzazione esplicita,
creera:

| Entita | Scopo | Campi chiave |
| --- | --- | --- |
| `trend_source_runs` | Audit di esecuzione | `source`, `niche`, `provider_run_id`, `status`, `attempt`, `started_at`, `finished_at`, `error_code`, `item_count`, `cost_usd` |
| `trend_signals` | Segnale citabile | `source`, `external_id`, `canonical_url`, `title`, `content`, `published_at`, `observed_at`, `score`, `metadata`, `provenance`, `content_hash` |
| `trend_snapshots` | Insieme generabile | `niche`, `as_of`, `signal_ids`, `source_summary`, `quality`, `expires_at` |
| `brief_trend_evidence` | Legame brief-segnale | `brief_id`, `signal_id`, `role`, `created_at` |

`provenance` include provider, Task/Actor id, run id, URL originale, momento di
osservazione e versione adapter; non include mai token o cookie. Il dedupe usa
prima `source + external_id`, poi URL canonico, poi `content_hash`.

`trends_cache` resta compatibile durante la transizione ed e materializzato
dallo snapshot approvato. I consumer non leggono dataset Apify direttamente.

## Quality gate

Uno snapshot e valido solo con almeno 12 segnali normalizzati e non duplicati,
almeno 2 fonti sane, almeno una fonte nativa (YouTube/RSS), un segnale entro 72
ore, nessun segnale oltre 14 giorni e provenance completa. Una fonte degradata
non blocca il set se il restante soddisfa il gate. Lo snapshot precedente e
riusabile soltanto per 72 ore, indicando sempre `as_of`; oltre si fallisce
chiuso con `503 trends_unavailable` retryable.

## Retry, fallback e costi

- `job_queue` usa `trend-ingest:<source>:<niche>:<UTC-date-hour>` come dedupe key.
- Tre tentativi transitori, con jitter e backoff a 5, 15 e 45 minuti.
- Errori input/schema o 401/403 passano in dead letter.
- Tre fallimenti in 24 ore aprono un circuit breaker di 6 ore per la sola fonte.
- Reddit e Google Trends sono additive; YouTube/RSS restano fallback indipendente.
- Ogni run registra costo se disponibile; limite di una run/fonte/nicchia/ora e
  budget giornaliero configurabile disabilitano solo Apify al superamento.

## Sicurezza e configurazione

- `APIFY_TOKEN` e il segreto webhook vivono solo in Vercel e nel runtime locale;
  mai repository, dataset, log o client bundle.
- Il webhook verifica firma in tempo costante e usa `provider_run_id` come chiave
  di idempotenza.
- Adapter server-only validano output a runtime e scartano URL non HTTPS, testo
  sproporzionato e campi inattesi.
- L'MCP Apify e operativo per Task e benchmark, non e una dipendenza runtime.

## Rollout e verifica

1. Riavvio Codex con token sicuro e secret Vercel.
2. Benchmark autorizzato di due Actor Reddit e due Google Trends: costo, schema,
   successo, limiti e conformita.
3. Task approvate su dataset non produttivo.
4. Implementazione feature-flagged, fonti Apify disabilitate per default.
5. Sette giorni di osservazione di source runs, dead letter, costi e quality.
6. Abilitazione progressiva e copy pubblica aggiornata solo dopo esito positivo.

Test richiesti: adapter, dedupe, freshness/diversity gate, retry, circuit
breaker, firma webhook e integrazione `source run -> snapshot -> cache -> brief`.
Cache assente, Apify down, dataset malformato, duplicati e snapshot scaduto
devono restituire errore retryable senza avviare scraping.

## Checklist

- [x] Direzione a quattro fonti approvata.
- [x] Spec architetturale e criteri di qualità definiti.
- [ ] Benchmark Actor Apify autorizzato.
- [ ] Task Apify e secret environment configurati.
- [ ] Piano d'implementazione revisionato e approvato.
- [ ] Migration creata, mai applicata senza backup/autorizzazione.
- [ ] Feature flag, test e osservabilita implementati.
- [ ] Rollout controllato di sette giorni completato.
