# RepsBrief — Post-Fix Integration Plan

Last update: 2026-03-09
Scope: roadmap esecutiva da avviare dopo completamento `TECHNICAL_FIXES_PLAN.md` (`P0 -> P3`).

## Goal

Sbloccare nuove integrazioni senza regressioni su sicurezza/runtime, mantenendo i guardrail:
- OAuth-first,
- team-first + RLS,
- observability by default,
- TypeScript-only.

## Execution Order

1. [x] `P4.1` Trello/ClickUp OAuth design spike.
2. [x] `P4.2` Trello/ClickUp MVP implementation (ClickUp + Trello completati).
3. [x] `P4.3` Queue/Jobs spike (retry + dead-letter per delivery) con PoC DB queue.
4. [ ] `P4.4` Observability hardening (Sentry + alerting path critici).
5. [ ] `P4.5` Publishing connectors spike (WordPress/Ghost).
6. [ ] `P4.6` Cloud asset sync spike (Drive/Dropbox).

Execution artifact:
- `TRELLO_CLICKUP_OAUTH_SPIKE.md`
- `QUEUE_JOBS_SPIKE.md`

P4.2 progress snapshot:
- [x] ClickUp OAuth MVP implemented.
- [x] Trello OAuth MVP implemented.

## P4.1 — Trello/ClickUp OAuth Design Spike

Deliverables:
- Contract provider (`start/callback/connect/disconnect/test`).
- Mapping schema per `team_integrations.metadata`.
- Scope minimi richiesti (least privilege).
- UX states Settings (`disconnected`, `pending`, `active`, `error`).

Acceptance:
- Documento tecnico approvato con sequence diagram.
- Nessun token lato client.

Validation:
1. Threat-model rapido (`state`, `nonce`, TTL, callback replay).
2. Checklist redirect URI dev/stage/prod.
3. Review RLS (`owner/admin` only).

## P4.2 — Trello/ClickUp MVP (Implementation)

Approccio:
- Implementare prima un provider (`trello` o `clickup`), poi replicare pattern.
- Riutilizzare blueprint OAuth esistente (Slack/Discord/Google/Notion).

Deliverables:
- `GET /api/auth/<provider>/start`
- `GET /api/auth/<provider>/callback`
- Server actions `connect/disconnect/test`
- Rendering pannello provider in `IntegrationsSettings`
- Logging su `team_integration_logs`

Acceptance:
- Connect/disconnect/test funzionanti end-to-end.
- Stato integrazione visibile in Settings.
- Nessuna regressione su provider esistenti.

Validation:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run test:e2e`
5. `npm run build`
6. Smoke manuale connect -> callback -> test -> disconnect.

## P4.3 — Queue/Jobs Layer Spike

Goal:
- Eliminare failure transienti non recuperate su webhook/cron.

Deliverables:
- Decision record (`Inngest` vs `QStash` vs `pgmq`).
- Retry policy standard (max attempts + backoff).
- Dead-letter strategy.

Acceptance:
- Una proposta implementabile con effort stimato e risk matrix.

## P4.4 — Observability Hardening

Deliverables:
- Error tracking su callback OAuth, trigger webhook, cron weekly.
- Alert minimi su failure rate e job retry exhaustion.

Acceptance:
- Errori critici visibili entro pochi minuti.
- Correlazione evento tramite `team_id`, `provider`, `action`.

## P4.5/P4.6 — Integration Spikes (Publishing + Asset Sync)

Deliverables:
- Scope API minimi e limiti rate.
- Mappatura payload da brief/idea -> draft/asset.
- Stima effort per MVP.

Acceptance:
- Prioritizzazione finale basata su impatto utente + costo operativo.

## Rollout Policy

Ogni incremento post-fix deve includere:
1. Patch codice + eventuale migration.
2. Update stato in `INIT_PROMPT.md` e `PROJECT_CONTEXT.md`.
3. Validazione (`lint`, `typecheck`, `test`, `test:e2e`, `build`).
4. Security baseline (`npm audit --audit-level=moderate`).
5. Smoke test manuale su percorso utente reale.
