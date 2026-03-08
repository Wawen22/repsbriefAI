# RepsBrief — Trello/ClickUp OAuth Design Spike (P4.1)

Last update: 2026-03-08
Status: Completed (design spike) + ClickUp MVP executed (phase A)
Owner: Integrations stream

## 1) Objective

Implementare integrazione task-management team-first partendo da OAuth sicuro e riusabile, senza rompere il blueprint già in produzione (Notion/Google/Slack/Discord).

Target:
- creare task/card da eventi `idea.approved` e `content.scheduled`,
- mantenere connect/disconnect/test in Settings,
- tracciare ogni azione su `team_integration_logs`.

## 2) Scope & Order

Ordine esecutivo consigliato:
1. `Provider #1`: ClickUp (MVP).
2. `Provider #2`: Trello (replica pattern con adapter dedicato).

Motivo:
- riduce blast radius,
- consente validazione pipeline OAuth+RBAC una volta sola,
- accelera rollout iterativo.

## 3) Architecture Contract (All Providers)

Contratto minimo per provider:
- `GET /api/auth/<provider>/start?team_id=<id>`
- `GET /api/auth/<provider>/callback`
- client action `connect<Provider>()` in `src/app/actions/integrations.ts`
- server action `disconnect<Provider>IntegrationAction(teamId)`
- server action `test<Provider>IntegrationAction(teamId)`

Pattern obbligatorio:
- `state` base64url con `{ teamId, nonce, iat }`
- cookie nonce `HttpOnly`, `sameSite=lax`, TTL 10m
- callback con validazione `state+nonce+ttl`
- RBAC owner/admin su `team_members`
- persist in `team_integrations`
- log outcome in `team_integration_logs`

## 4) Data Model Mapping

Tabella: `team_integrations`

`provider` values:
- `trello`
- `clickup`

`encrypted_credentials` (JSON):
- Trello:
  - `access_token`
  - `token_secret` (se richiesto dal flow)
  - `scope`
- ClickUp:
  - `access_token`
  - `refresh_token` (se disponibile)
  - `expires_at` (epoch ms)
  - `scope`

`settings` (JSON):
- Trello:
  - `workspace_id`
  - `workspace_name`
  - `default_board_id`
  - `default_list_id`
- ClickUp:
  - `workspace_id`
  - `workspace_name`
  - `default_space_id`
  - `default_list_id`

`status`:
- `active`, `error`, `expired`

Nota: evitare nuove tabelle nel MVP; usare `settings` con schema validato runtime (zod).

## 5) Event -> Task/Card Mapping

Eventi iniziali supportati:
- `idea.approved`
- `content.scheduled`

Payload template (provider-agnostic):
- `title`: idea/content title
- `description`: summary + metadata platform/niche/date
- `labels/tags`: `event_type`, `team_id`, `niche` (se disponibile)
- `due_date`: per `content.scheduled`

## 6) Security & Reliability Requirements

Mandatory:
- nessun token lato client o querystring dopo callback,
- redirect URL bloccati per ambiente (`NEXT_PUBLIC_APP_URL`),
- cleanup cookie nonce sempre in callback (success/error),
- logging errori OAuth + API provider con `provider/action/status`.

Reliability baseline:
- test action che crea oggetto sintetico e lo elimina (se API supporta delete),
- fallback: se create/delete non supportato, crea card/task prefisso `[TEST]`.

## 7) UI/UX Requirements (Settings)

Nuovi provider card:
- `Trello Tasks`
- `ClickUp Tasks`

Stati:
- disconnected -> pulsante `Connect`
- active -> `Manage` + `Test` + `Disconnect`
- error/expired -> `Reconnect`

Gestione default destination:
- select board/list (Trello) o workspace/list (ClickUp)
- salva in `team_integrations.settings`

## 8) Implementation Plan (P4.2)

Step 1:
- `src/lib/integrations/clickup.ts` (exchange token + workspace validation)
- route:
  - `src/app/api/auth/clickup/start/route.ts`
  - `src/app/api/auth/clickup/callback/route.ts`

Step 2:
- client action `connectClickUp()` in `src/app/actions/integrations.ts`
- server actions `disconnectClickUpIntegrationAction`, `testClickUpIntegrationAction`

Step 3:
- update UI:
  - `src/components/settings/integrations/types.ts`
  - `src/components/settings/IntegrationsSettings.tsx`
  - eventuale componente dedicato per destination settings

Step 4:
- logging:
  - `provider='clickup'`
  - actions: `auth_success`, `auth_error`, `test_send`, `disconnect`

Step 5:
- tests:
  - unit su parser `state` + validators
  - smoke route import in `tests/e2e/routes-smoke.test.ts`

Step 6 (next):
- implementare Trello con lo stesso contract (`start/callback/connect/disconnect/test`) dopo validazione grant model definitivo.

## 9) Acceptance Criteria (Design Spike)

- [x] Definito contract end-to-end OAuth-first.
- [x] Definito mapping dati in `team_integrations`.
- [x] Definita strategia RBAC/logging.
- [x] Definito piano implementativo sequenziale per `P4.2`.

## 10) Risks & Open Questions

- Trello/ClickUp possono differire su grant model/scope/token lifecycle:
  - validare nei rispettivi developer portal prima del coding.
- Necessità di refresh token per job asincroni:
  - se assente, prevedere reconnect UX chiara.
- Rate limits provider:
  - introdurre throttling leggero in adapter provider.

## 11) Execution Update (2026-03-08)

- ClickUp MVP implementato:
  - route `start/callback`,
  - action `connect/disconnect/test`,
  - pannello Settings dedicato.
- Trello MVP rimane prossimo incremento sequenziale.
