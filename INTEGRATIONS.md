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
| **Notion API** | ✅ Completato | Export diretto delle strategie in un database o pagina Notion. | 🔥 Alta |
| **Google Calendar** | 📅 In Planning | Sincronizzazione del calendario editoriale di RepsBrief con GCal. | 🔥 Alta |
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
Le integrazioni sono salvate nella tabella `team_integrations`:
- `id`: UUID (Primary Key)
- `team_id`: UUID (Foreign Key -> teams)
- `provider`: String (es: 'notion', 'google_calendar')
- `encrypted_credentials`: JSONB (AccessToken, RefreshToken, Expiry)
- `settings`: JSONB (ID del database Notion, ID del Calendario, ecc.)
- `status`: String ('active', 'error', 'expired')

### 2. Sicurezza (Best Practices)
- **Encryption:** I token saranno crittografati a riposo.
- **RLS (Row Level Security):** Solo i membri del team con permessi di admin possono gestire le integrazioni.
- **OAuth 2.0:** Utilizzo esclusivo di flussi OAuth standard per non gestire mai le password degli utenti.

---

## 📑 Log delle Implementazioni

### [2026-03-06] - Integrazione Notion API Completata
- Implementato flusso OAuth 2.0 (Client & Server side).
- Supporto per **Notion API v2025-09-03** (Multi-source databases / Data Sources).
- Implementato **Dynamic Title Detection**: l'app rileva automaticamente il nome della colonna titolo nel database Notion dell'utente.
- Aggiunta Server Action `exportStrategyToNotionAction` per esportazione asincrona.
- UI Aggiornata: Tasto "SEND TO NOTION" con stato di caricamento e link diretto alla pagina creata.
- Aggiunta Tab "Integrations" in Settings.
