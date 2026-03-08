# RepsBrief Integrations Roadmap 🔌

Questo documento traccia lo stato delle integrazioni esterne (Plugins/Connections) di RepsBrief. L'obiettivo è trasformare RepsBrief in un hub operativo che si collega ai tool già usati dagli utenti.

Checklist operativa unica (dev/staging/prod):
- [INTEGRATIONS_CHECKLIST.md](./INTEGRATIONS_CHECKLIST.md)

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
| **Discord OAuth** | 🛠 In progress | OAuth one-click + webhook bootstrap + test send + disconnect/reconnect in Settings. | 🔥 Alta |
| **Trello / ClickUp** | 📋 Backlog | Creazione automatica di card/task per il team. | 🟡 Media |

### Fase 3: Publishing & Content Hub (Brainstorming)
| Integrazione | Stato | Funzionalità | Priorità |
| :--- | :--- | :--- | :--- |
| **WordPress / Ghost** | 📄 Backlog | Esportazione script come bozze articolo/newsletter. | 🟢 Bassa |
| **Cloud Storage** | ☁️ Backlog | Cartelle automatiche (Drive/Dropbox) per asset video. | 🟢 Bassa |
| **Social API** | 📱 R&D | Pubblicazione diretta (LinkedIn/X) o Drafts (IG/TikTok). | 🟡 Media |

---

## 🛠️ Architettura Tecnica

### 1. Database Schema
- `team_integrations`: Gestione token OAuth (Notion, Google).
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
