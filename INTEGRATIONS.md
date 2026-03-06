# RepsBrief Integrations Roadmap 🔌

Questo documento traccia lo stato delle integrazioni esterne (Plugins/Connections) di RepsBrief. L'obiettivo è trasformare RepsBrief in un hub operativo che si collega ai tool già usati dagli utenti.

## 🎯 Obiettivi Core
- **Automazione:** Ridurre il "friction" tra la generazione della strategia e la sua esecuzione.
- **Team-Centric:** Le integrazioni sono collegate al **Team Workspace**, non al singolo utente (dove possibile).
- **Sicurezza:** Gestione sicura dei token OAuth e conformità alle policy dei provider.
- **Zero Costi:** Utilizzo esclusivo di API native e tier gratuiti.

---

## 🗺️ Roadmap delle Integrazioni

### Fase 1: Produttività & CMS (Corrente)
| Integrazione | Stato | Funzionalità | Priorità |
| :--- | :--- | :--- | :--- |
| **Notion API** | ⏳ In Planning | Export diretto delle strategie in un database o pagina Notion. | 🔥 Alta |
| **Google Calendar** | 📅 Backlog | Sincronizzazione del calendario editoriale di RepsBrief con GCal. | 🔥 Alta |
| **Webhooks (Zapier/Make)** | 🔗 Backlog | Invio dati a URL esterni per automazioni custom. | 🟡 Media |

### Fase 2: Task Management
| Integrazione | Stato | Funzionalità | Priorità |
| :--- | :--- | :--- | :--- |
| **Trello** | 📋 Backlog | Creazione automatica di card da idee approvate. | 🟡 Media |
| **Asana** | 📋 Backlog | Creazione di task nel workspace del team. | 🟢 Bassa |

### Fase 3: Social Publishing (Direct)
| Integrazione | Stato | Funzionalità | Priorità |
| :--- | :--- | :--- | :--- |
| **LinkedIn** | 📄 Backlog | Scheduling e posting diretto di post testuali/caroselli. | 🟡 Media |
| **X (Twitter)** | 🐦 Backlog | Pubblicazione di thread generati dall'AI. | 🟢 Bassa |

---

## 🛠️ Architettura Tecnica

### 1. Database Schema
Le integrazioni saranno salvate nella tabella `team_integrations`:
- `id`: UUID (Primary Key)
- `team_id`: UUID (Foreign Key -> teams)
- `provider`: String (es: 'notion', 'google_calendar')
- `credentials`: JSONB (AccessToken, RefreshToken, Expiry - *Crittografati*)
- `settings`: JSONB (ID del database Notion, ID del Calendario, ecc.)
- `status`: String ('active', 'error', 'expired')

### 2. Sicurezza (Best Practices)
- **Encryption:** I token saranno crittografati a riposo.
- **RLS (Row Level Security):** Solo i membri del team con permessi di admin possono gestire le integrazioni.
- **OAuth 2.0:** Utilizzo esclusivo di flussi OAuth standard per non gestire mai le password degli utenti.

---

## 📑 Log delle Implementazioni

### [2026-03-06] - Inizio Progetto Integrazioni
- Creato documento di roadmap.
- Scelta la prima integrazione: **Notion API**.
- Definita l'architettura del database per i token.
