# RepsBrief Integrations Roadmap 🔌

Questo documento traccia lo stato delle integrazioni esterne (Plugins/Connections) di RepsBrief. L'obiettivo è trasformare RepsBrief in un hub operativo che si collega ai tool già usati dagli utenti.

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
| **Slack / Discord** | 📅 Backlog | Notifiche istantanee per approvazioni e nuovi brief. | 🟡 Media |
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

## 📑 Log delle Implementazioni

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
