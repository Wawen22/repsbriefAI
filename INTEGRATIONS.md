# RepsBrief Integrations Roadmap 🔌

Questo documento traccia lo stato delle integrazioni esterne (Plugins/Connections) di RepsBrief. L'obiettivo è trasformare RepsBrief in un hub operativo che si collega ai tool già usati dagli utenti.

Checklist operativa unica (dev/staging/prod):
- [INTEGRATIONS_CHECKLIST.md](./INTEGRATIONS_CHECKLIST.md)

Priorita' integrazioni raccomandate post-hardening (dopo fix P0/P1):
- [TECHNICAL_FIXES_PLAN.md](./TECHNICAL_FIXES_PLAN.md)
- [POST_FIX_INTEGRATION_PLAN.md](./POST_FIX_INTEGRATION_PLAN.md)

## 🎯 Obiettivi Core
- **Automazione:** Ridurre il "friction" tra la generazione della strategia e la sua esecuzione.
- **Team-Centric:** Le integrazioni sono collegate al **Team Workspace**, non al singolo utente (dove possibile).
- **Sicurezza:** Gestione sicura dei token OAuth e conformità alle policy dei provider.
- **Zero Costi:** Utilizzo esclusivo di API native e tier gratuiti.

---

## 🗺️ Roadmap delle Integrazioni

### Fase 1: Produttività & Automazione (Completata ✅)
| Integrazione | Stato | Funzionalità | Priorità |
| :--- | :--- | :--- | :--- |
| **Notion API** | ✅ Completato | Export diretto delle strategie in database o pagine Notion. | 🔥 Alta |
| **Google Calendar** | ✅ Completato | Sync automatico e bulk degli eventi editoriali. | 🔥 Alta |
| **Webhooks (Zapier/Make)**| ✅ Completato | Connessione universale per automazioni esterne. | 🔥 Alta |

### Fase 2: Collaborazione & Task Management (In Arrivo)
| Integrazione | Stato | Funzionalità | Priorità |
| :--- | :--- | :--- | :--- |
| **Slack OAuth** | ✅ Completato | Connessione no-code + bootstrap webhook automatico + hardening state nonce. | 🔥 Alta |
| **Discord OAuth** | ✅ Completato | OAuth one-click + webhook bootstrap + test send + disconnect/reconnect in Settings. | 🔥 Alta |
| **ClickUp OAuth** | ✅ MVP Completato | Connect/disconnect/test + persistenza team-level + pannello Settings dedicato. | 🟡 Media |
| **Trello OAuth** | ✅ MVP Completato | Connect/disconnect/test + persistenza team-level + pannello Settings dedicato. | 🟡 Media |

### Fase 3: Publishing & Content Hub (Brainstorming)
| Integrazione | Stato | Funzionalità | Priorità |
| :--- | :--- | :--- | :--- |
| **WordPress / Ghost** | 📄 Backlog | Esportazione script come bozze articolo/newsletter. | 🟢 Bassa |
| **Cloud Storage** | ☁️ Backlog | Cartelle automatiche (Drive/Dropbox) per asset video. | 🟢 Bassa |
| **Social API** | 📱 R&D | Pubblicazione diretta (LinkedIn/X) o Drafts (IG/TikTok). | 🟡 Media |

---

## 🛠️ Architettura Tecnica

### 1. Database Schema
- `team_integrations`: Gestione token OAuth provider (Notion, Google, Slack, Discord, ClickUp, Trello).
- `team_webhooks`: Configurazione URL, segreti HMAC e eventi.
- `team_integration_logs`: Storico tentativi di invio e successi.

### 2. Webhooks Engine
Il sistema supporta l'invio asincrono di payload JSON con firma di sicurezza:
- **Header di Sicurezza**: `X-RepsBrief-Signature` (HMAC-SHA256) e `X-RepsBrief-Timestamp`.
- **Eventi Supportati**:
    - `brief.ready`: Scatenato quando un nuovo brief settimanale è disponibile.
    - `idea.approved`: Scatenato quando un admin approva un'idea nello Studio.
    - `content.scheduled`: Scatenato quando un post viene aggiunto al calendario editoriale.

---

## 🔐 OAuth-First Blueprint (2026-03-07)

### Standard comune per nuove integrazioni
- **Entry point server-side**: route `start` che genera `state` nonce, salva cookie `HttpOnly`, poi redirect al provider.
- **Callback sicura**: validazione `state` + scambio codice su backend + nessun token in query/client.
- **Token storage**: token per `team_id` in `team_integrations` (scope minimo, status lifecycle, metadata audit).
- **RBAC**: connect/disconnect/reconnect solo owner/admin (allineato alle policy RLS correnti).
- **Observability**: ogni connect/test/send scrive su `team_integration_logs`.
- **Revoke/Reconnect UX**: pulsanti espliciti in Settings (clear token, reconnect, test send).
- **Fallback tecnico**: mantenere webhook manuale come fallback solo per ambienti non OAuth-friendly.

### Contract minimo provider (riusabile)
- `GET /api/auth/<provider>/start`
- `GET /api/auth/<provider>/callback`
- `connect` action (persist token + status active)
- `disconnect` action (status disconnected + cleanup token)
- `test` action (invio evento sintetico + log)

### Blueprint Discord (target immediato)
- **Provider key**: `discord`.
- **Scope iniziale**: `identify`, `guilds`, `webhook.incoming` (espandere solo se necessario).
- **Flow UX**:
  - Admin clicca `Connect Discord`.
  - OAuth ritorna con selezione server/canale (o webhook target) guidata.
  - RepsBrief salva integrazione team-level e abilita test immediato.
- **Payload standard**: riuso formattazione eventi webhook già in uso (`brief.ready`, `idea.approved`, `content.scheduled`).
- **Failure policy**: retry leggero + log dettagliato su `team_integration_logs` + stato visuale in Settings.
- **Security checks**:
  - Verifica `state` obbligatoria.
  - No secret/token in client logs.
  - Sanitizzazione metadata del callback prima del persist.

---

## 📑 Log delle Implementazioni

### [2026-03-08] - Hardening Wave P0/P1.1
- Cron paid-plan filter allineato a `ACTIVE_PAID_PLANS` (`pro/team`) in `weeklyBrief`.
- Webhooks engine allineato a percorso admin per delivery/log in runtime server.
- Aggiunta migration `20260308143000_add_insert_policy_team_integration_logs.sql` (policy `INSERT` owner/admin su logs).
- OAuth Notion/Google hardening:
  - Nuove route server-side `GET /api/auth/google/start` e `GET /api/auth/notion/start`.
  - Callback con validazione `state` (nonce cookie HttpOnly + TTL) e RBAC owner/admin.
  - Redirect hardening basato su `NEXT_PUBLIC_APP_URL` (fallback `req.nextUrl.origin`).
- Fail-fast production sui path critici che richiedono privilegi admin (`SUPABASE_SERVICE_ROLE_KEY`).
- Aggiunta baseline quality gate:
  - test unit (`vitest`) + smoke suite route import,
  - script `typecheck/test/test:e2e`,
  - workflow CI GitHub Actions (`lint`, `typecheck`, `test`, `build`, `test:e2e`).
- Refactor maintainability UI:
  - `IntegrationsSettings` separata in componenti riusabili (`ProvidersGrid`, `WebhookChannelSection`),
  - hook dedicato `useIntegrationsData` per team context e fetch integrazioni/webhooks.
- Security maintenance wave:
  - eseguito `npm audit fix`,
  - stato dipendenze: `0 vulnerabilities`,
  - regression checks verdi (`lint`, `typecheck`, `test`, `test:e2e`, `build`).

### [2026-03-08] - Trello/ClickUp OAuth Design Spike (P4.1) Completato
- Definito contract OAuth-first per provider task-management:
  - `GET /api/auth/<provider>/start`,
  - `GET /api/auth/<provider>/callback`,
  - action `connect/disconnect/test`.
- Definito mapping `team_integrations`:
  - provider values `trello`/`clickup`,
  - schema base per `encrypted_credentials` e `settings`.
- Definito piano implementativo sequenziale:
  - ClickUp MVP prima, Trello subito dopo con adapter riusabile.
- Definiti security/reliability guardrail:
  - nonce `HttpOnly`, TTL, RBAC owner/admin, logging obbligatorio su `team_integration_logs`.
- Artefatto tecnico:
  - `TRELLO_CLICKUP_OAUTH_SPIKE.md`.

### [2026-03-08] - ClickUp OAuth MVP (P4.2 phase A) Implementato
- Aggiunte route OAuth:
  - `GET /api/auth/clickup/start`
  - `GET /api/auth/clickup/callback`
- Hardening callback:
  - validazione `state` (`teamId`, nonce, TTL),
  - RBAC owner/admin prima del persist token,
  - cleanup cookie nonce su successo/errore.
- Persistenza integrazione:
  - upsert `team_integrations` con `provider=clickup`,
  - salvataggio credential/settings workspace team-level.
- Settings UI:
  - provider `ClickUp Tasks` nel grid integrazioni,
  - pannello gestione con `Reconnect`, `Test Connection`, `Disconnect`.
- Server actions:
  - `testClickUpIntegrationAction` (verifica workspace API + log),
  - `disconnectClickUpIntegrationAction` (revoca locale + log).
- Fix callback/runtime:
  - normalizzazione token OAuth ClickUp (`access_token`/`token`/`oauth_token`),
  - gestione header Authorization con fallback (`raw`/`Bearer`) per evitare errore `Oauth token not found`.
- Checklist/env aggiornati:
  - `.env.example` (`CLICKUP_CLIENT_ID`, `CLICKUP_CLIENT_SECRET`),
  - `INTEGRATIONS_CHECKLIST.md` (redirect + env + smoke scope).

### [2026-03-09] - Trello OAuth MVP (P4.2 phase B) Implementato
- Aggiunte route OAuth:
  - `GET /api/auth/trello/start`
  - `GET /api/auth/trello/callback`
- Flow OAuth1 hardening:
  - request token + token secret in cookie `HttpOnly` con TTL,
  - validazione callback `oauth_token`/`oauth_verifier`,
  - RBAC owner/admin prima del persist su team.
- Persistenza integrazione:
  - upsert `team_integrations` con `provider=trello`,
  - salvataggio credenziali team-level (`access_token`, `token_secret`) e metadata account/workspace.
- Settings UI:
  - provider `Trello Tasks` nel grid integrazioni,
  - pannello gestione con `Reconnect`, `Test Connection`, `Disconnect`.
- Server actions:
  - `testTrelloIntegrationAction` (verifica member/workspaces API + log),
  - `disconnectTrelloIntegrationAction` (cleanup locale + log).
- Copertura quality gate:
  - esteso smoke import routes OAuth (`tests/e2e/routes-smoke.test.ts`),
  - regression suite verde (`lint`, `typecheck`, `test`, `test:e2e`, `build`).

### [2026-03-09] - Integrations Settings UX Refinement
- Sostituito il comportamento multi-pannello con disclosure `single-open` (una sola integrazione aperta alla volta).
- Introdotto stato condiviso `activePanel` in `IntegrationsSettings` per eliminare apertura simultanea e ambiguità visuale.
- Migliorata la leggibilità CTA provider:
  - pulsante ad alto contrasto (`Apri pannello` / `Aperta`),
  - stato `Open` badge su card attiva,
  - evidenziazione card aperta (border/ring/background dedicati).
- Comportamento coerente su close/disconnect/delete:
  - il pannello attivo si richiude quando la connessione viene rimossa o il canale viene scollegato.

### [2026-03-08] - Discord OAuth-first (MVP) Implementato
- Aggiunte route OAuth:
  - `GET /api/auth/discord/start`
  - `GET /api/auth/discord/callback`
- Implementato exchange token Discord (`src/lib/integrations/discord.ts`) con supporto a `webhook.incoming`.
- Bootstrap automatico:
  - Upsert `team_integrations` (`provider=discord`)
  - Upsert webhook canale `discord` in `team_webhooks`
  - Log `auth_success` in `team_integration_logs`
- Esteso engine webhook per `channel=discord` con payload preformattato (embeds Discord).
- Estesa UI Settings:
  - Nuovo provider "Discord Notifications"
  - Gestione canali Discord (view/test/toggle/delete)
  - Pulsante `Disconnect` (cleanup webhook + credentials/reset status integrazione)
- Aggiunta migration `20260308100000_add_discord_channel_to_team_webhooks.sql`
  - estende check constraint `team_webhooks_channel_check` a `discord`.
- Aggiornato `.env.example` con `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`.

### [2026-03-06] - Integrazione Webhooks (Zapier/Make) Completata
- Creata tabella `team_webhooks` con supporto a multipli endpoint.
- Sviluppato Engine di invio con firma HMAC per massima sicurezza.
- Aggiunta console di gestione in Settings > Integrations con funzione di **Test Send**.
- Inseriti trigger automatici in Approval Flow, Calendar e Brief Generation.

### [2026-03-06] - Integrazione Google Calendar Completata
- Implementato OAuth 2.0 con gestione automatica del Refresh Token.
- Aggiunta funzione **Bulk Sync** per allineare eventi passati/manuali.
- Integrazione nello **Studio** e nel **CalendarView**.

### [2026-03-06] - Integrazione Notion API Completata
- Supporto Notion API v2025-09-03 (Data Sources).
- Implementato **Dynamic Title Detection**.
