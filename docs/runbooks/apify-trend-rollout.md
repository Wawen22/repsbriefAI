# Apify trend rollout runbook

Last updated: 2026-09-02

## Scope and safety boundary

Reddit and Google Trends are additive sources. YouTube and RSS remain the native
fallback. A user request must only read a verified trend snapshot; it must never
start an Apify Task or wait for a dataset.

This runbook does not authorize an Actor or Task run that may incur cost. Obtain
the explicit benchmark authorization first, then execute the steps below with
redacted IDs and timestamps only. Never put tokens, webhook payloads, task
inputs containing personal data, or full datasets in tickets or logs.

## Required server-side configuration

Configure these names in local runtime and Vercel Preview/Production. Values are
secrets unless marked as a flag; do not commit them.

| Name | Required for | Rule |
| --- | --- | --- |
| `APIFY_TOKEN` | starting/polling Apify Tasks | server-only secret; rotate if exposed |
| `APIFY_WEBHOOK_SECRET` | Apify callback validation | server-only secret; unique per environment |
| `APIFY_REDDIT_TASK_ID` | Reddit rollout | server-only Task identifier |
| `APIFY_GOOGLE_TRENDS_TASK_ID` | Google Trends rollout | server-only Task identifier |
| `TREND_REDDIT_ENABLED` | Reddit feature flag | literal `true` only after its seven-day review |
| `TREND_GOOGLE_TRENDS_ENABLED` | Google Trends feature flag | literal `true` only after its seven-day review |
| `TREND_APIFY_DAILY_BUDGET_USD` | cost ceiling | positive finite USD value approved for the benchmark |

The absence of either source flag, any value other than literal `true`, or a
missing/invalid daily budget leaves that source out of ingestion. Before every
Apify run the worker sums known `cost_usd` for the current UTC day and blocks
the run when the ceiling has been reached; if that query is unavailable it
fails closed. Because Apify reports the final cost after a run completes, the
ceiling prevents subsequent runs and must include headroom for one in-flight
run. Do not expose any of
these names through `NEXT_PUBLIC_*` variables.

## Benchmark gate

For each candidate Reddit and Google Trends Task, record:

1. Task/Actor public identity and version, input schema and provider terms.
2. One authorized test-run cost, duration, item count, success/failure and API
   limits, without retaining token or raw personal content.
3. Adapter acceptance rate, duplicate rate, invalid URL/timestamp rate and
   whether its normalized output has complete provenance.
4. A daily ceiling derived from the observed cost with headroom, stored as
   `TREND_APIFY_DAILY_BUDGET_USD`. If the ceiling is unknown, do not enable a
   source.

Reject a candidate that cannot provide HTTPS canonical URLs, stable identifiers,
valid timestamps, predictable cost, or a compliant usage basis.

## Seven-day rollout

1. Keep both flags disabled after configuration and deploy.
2. Enable one source only (Reddit first), in Preview or an authorized controlled
   production window. Keep the other source disabled.
3. For seven full UTC days, review `trend_source_runs` at least daily: queued,
   succeeded, failed/dead-letter counts; duration; item count; known `cost_usd`;
   retry/circuit-open errors; and snapshot quality/freshness.
4. Alert and roll back the source flag if three failures occur in 24 hours, a
   circuit opens, cost reaches the approved ceiling, invalid data affects the
   quality gate, or the snapshot gate no longer has two healthy sources.
5. Only after a clean seven-day period may the second source follow the same
   process. Public landing/product copy continues to mention only active,
   verified sources until this review is complete.

## Rollback and incident response

Set the affected `TREND_*_ENABLED` flag to `false` and redeploy/restart the
server runtime. Do not delete trend history. Confirm the next scheduling cycle
creates only native-source jobs, the last valid snapshot remains within its
72-hour freshness window, and user generation returns its existing retryable
`503` after the cache expires rather than scraping inline.

For a suspected token or webhook-secret exposure, disable both Apify flags,
rotate the exposed secret in Apify and Vercel, then repeat signature and
fail-closed checks before any new authorized run.
