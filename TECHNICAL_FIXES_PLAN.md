# RepsBrief — Technical Fixes Plan (Execution Order)

Last update: 2026-03-08

## Goal

Stabilizzare runtime/sicurezza/operativita' prima di nuove integrazioni, riducendo rischi su:
- uso AI non intenzionale (costi),
- delivery automation non affidabile,
- inconsistenze RLS/logging,
- hardening OAuth.

## Execution Order

1. [x] `P0.1` Cron paid-plan filter hardening.
2. [x] `P0.2` Webhooks + integration logs RLS/runtime alignment.
3. [x] `P1.1` OAuth hardening Notion/Google (state nonce + start routes server-side + RBAC callback).
4. [x] `P1.2` `supabaseAdmin` fail-fast policy in ambienti non-local.
5. [x] `P2` Test/CI baseline.
6. [x] `P2` Refactor UI settings monolitica.
7. [x] `P3` Dependency/security maintenance wave.

## Fix Backlog

### P0.1 — Cron should process only paid users

Problem:
- Il cron weekly usa un filtro ambiguo sul piano e puo' includere utenti non paganti.

Actions:
- Usare `ACTIVE_PAID_PLANS` (`pro`, `team`) nel query filter.
- Mantenere comportamento esplicito e coerente con `lib/billing.ts`.

Acceptance:
- Nel risultato cron vengono processati solo utenti `pro/team`.
- Nessuna regressione su build/lint/typecheck.

Test:
1. Crea 1 utente `starter`, 1 `pro`.
2. Esegui endpoint cron manualmente.
3. Verifica che solo `pro` riceva nuovo brief.

---

### P0.2 — Webhooks/logs runtime + RLS alignment

Problem:
- `triggerWebhooks` puo' essere eseguito in contesti senza privilegi sufficienti (RLS admin-only su `team_webhooks`).
- `team_integration_logs` non ha policy `INSERT` esplicita per client autenticati owner/admin.

Actions:
- Eseguire lettura `team_webhooks` e insert su `team_integration_logs` con client admin sui path server.
- Aggiungere migration SQL con policy `INSERT` owner/admin su `team_integration_logs`.
- Migliorare gestione errori logging (non bloccare delivery, ma loggare chiaramente il fallimento di observability).

Acceptance:
- Eventi `brief.ready`, `idea.approved`, `content.scheduled` vengono consegnati anche quando triggerati da cron.
- Log inseriti correttamente in `team_integration_logs` nei casi utente owner/admin.

Test:
1. Configura webhook attivo su un team.
2. Triggera evento da:
   - cron weekly,
   - approvazione idea,
   - scheduling contenuto.
3. Verifica consegna endpoint e presenza record in `Automation Logs`.

---

### P1.1 — OAuth hardening Notion/Google

Problem:
- Notion/Google non sono allineati al blueprint OAuth-first (state nonce cookie HttpOnly + start route server-side).

Actions:
- Introdurre:
  - `GET /api/auth/notion/start`,
  - `GET /api/auth/google/start`.
- Spostare costruzione auth URL lato server.
- Validare `state` + nonce + TTL in callback.
- Verificare membership owner/admin nel callback prima di persistere token.

Acceptance:
- Flusso OAuth Notion/Google coerente con Slack/Discord hardening.
- Nessun token/secret in client code.

---

### P1.2 — `supabaseAdmin` reliability guard

Problem:
- Se manca `SUPABASE_SERVICE_ROLE_KEY`, il fallback su anon puo' produrre behavior parziale/silenzioso.

Actions:
- Fail-fast in runtime server critici (cron, stripe webhook, automation delivery path).
- Errore esplicito e observability chiara.

Acceptance:
- Nessuna modalita' "degradata silenziosa" su path admin.

---

### P2 — Testing & CI baseline

Actions:
- Aggiungere script `test` + `test:e2e`.
- Introdurre workflow CI (`lint`, `typecheck`, `build`, test smoke).

Acceptance:
- PR bloccate su regressioni fondamentali.

---

### P2 — Maintainability refactor (Settings Integrations)

Actions:
- Estrarre componenti per provider panel (`Generic`, `Slack`, `Discord`).
- Estrarre hook per team context e webhook management.

Acceptance:
- Riduzione complessita' file e miglior testabilita'.

---

### P3 — Dependency/Security maintenance

Actions:
- Eseguire `npm audit fix` controllato.
- Allineare lockfile e verificare regressioni runtime.

Acceptance:
- Riduzione vulnerabilita' high senza breaking changes.

## Execution Completion Snapshot (2026-03-08)

- [x] Tutti i fix `P0.1 -> P3` implementati e validati.
- [x] Quality gate locale completo:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e`
  - `npm run build`
- [x] Security check:
  - `npm audit --audit-level=moderate` -> `0 vulnerabilities`
- [x] Checklist stato aggiornata in:
  - `INIT_PROMPT.md`
  - `PROJECT_CONTEXT.md`

## Integration Opportunities (After Fixes)

Priorita' di integrazione da iniziare **dopo** completamento P0 + P1:

1. Trello/ClickUp OAuth (task management team-first).
2. Queue/Jobs layer (Inngest/QStash/pgmq) per retry + dead-letter + scheduling robusto.
3. Observability stack (Sentry + tracing + alerting) su OAuth/webhooks/cron.
4. Publishing connectors (WordPress/Ghost) per trasformare brief -> draft operativo.
5. Cloud asset sync (Drive/Dropbox) per pipeline creativa team.

Piano operativo dettagliato post-fix:
- `POST_FIX_INTEGRATION_PLAN.md`

## Rollout Policy

- Ogni fix richiede:
  - patch codice + eventuale migration,
  - update stato in `PROJECT_CONTEXT.md` e `INIT_PROMPT.md`,
  - validazione `npm run lint`, `npx tsc --noEmit`, `npm run test`, `npm run test:e2e`, `npm run build`,
  - verifica security baseline (`npm audit --audit-level=moderate`),
  - smoke test manuale focalizzato.
