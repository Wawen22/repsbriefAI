# Integrations Checklist (Dev / Staging / Prod)

Checklist unica per tutte le integrazioni presenti in RepsBrief:
- Notion OAuth
- Google Calendar OAuth
- Slack OAuth Notifications
- Discord OAuth Notifications
- Generic Webhooks (Zapier/Make/custom endpoint)

---

## 1) URL base applicazione (`NEXT_PUBLIC_APP_URL`)

- Dev HTTP: `http://localhost:3000`
- Dev HTTPS: `https://localhost:3000`
- Staging: `https://staging.<dominio>`
- Prod: `https://<dominio>`

`NEXT_PUBLIC_APP_URL` deve sempre combaciare con schema/host/porta realmente usati.

---

## 2) Redirect OAuth da registrare per provider

### Notion
- `<APP_URL>/api/auth/notion/callback`

### Google Calendar
- `<APP_URL>/api/auth/google/callback`

### Slack
- `<APP_URL>/api/auth/slack/callback`

### Discord
- `<APP_URL>/api/auth/discord/callback`

Note:
- Se cambi ambiente (es. localhost -> staging), devi aggiungere i redirect corrispondenti nel provider.
- In locale puoi usare HTTP o HTTPS in base a cosa il provider/tenant accetta e a come avvii l’app.

---

## 3) Variabili env richieste per integrazione

## Notion
- `NOTION_CLIENT_ID`
- `NOTION_CLIENT_SECRET`

## Google Calendar
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Slack OAuth
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_SIGNING_SECRET` (utile per endpoint/events futuri)
- `SLACK_APP_ID`

## Discord OAuth
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

## Globali utili al flusso
- `NEXT_PUBLIC_APP_URL`

---

## 4) Migrations / DB prerequisites

Applicare tutte le migration integrazioni in ogni ambiente:
- `20260306200000_create_team_integrations.sql`
- `20260306220000_create_team_webhooks.sql`
- `20260307153000_align_team_integration_logs_schema.sql`
- `20260307170000_add_channel_to_team_webhooks.sql`
- `20260307183000_harden_integrations_webhooks_rls.sql`
- `20260308100000_add_discord_channel_to_team_webhooks.sql`

Se mancano migration `channel`, Slack/Discord possono fallire su `team_webhooks`.

---

## 5) RBAC

Connect/Disconnect/Test integrazioni:
- consentito solo a `owner` / `admin`
- `member` deve essere bloccato

---

## 6) Smoke test per ogni provider OAuth

Per ciascuno tra Notion, Google, Slack, Discord:
1. Connect
2. Return callback senza errore
3. Provider risulta connected in Settings
4. Reconnect (se disponibile) o reconnect via connect
5. Disconnect (Slack/Discord attualmente esplicito)
6. Verifica log in `Automation Logs`

---

## 7) Webhooks generic (Zapier/Make/custom)

1. Aggiungi endpoint webhook custom
2. Esegui `Send test`
3. Verifica toggle active/inactive
4. Verifica delete
5. Controlla `Automation Logs` (`provider=webhook`)

---

## 8) Test eventi reali end-to-end

Triggerare almeno:
- `brief.ready`
- `idea.approved`
- `content.scheduled`

Verificare delivery:
- Slack/Discord: messaggio preformattato nel canale
- Generic: payload ricevuto dal consumer
- `Automation Logs`: `status=success` (o dettagli errore)

---

## 9) Errori comuni e fix rapidi

- `*_state_invalid` / `*_state_mismatch`:
  - schema/host/porta non allineati tra browser, `NEXT_PUBLIC_APP_URL`, redirect provider
  - cookie bloccati

- `*_auth_failed` / `*_setup_error`:
  - secret/client_id errati
  - redirect non registrato o differente

- Nessuna consegna su canale:
  - webhook non creato o non attivo
  - canale non corretto
  - policy del workspace/provider
  - migration DB mancanti

---

## 10) Security hygiene

- Non committare `.env`
- Ruotare subito secret condivisi in chat
- Limitare redirect URI solo a quelli necessari
- Verificare periodicamente token e log errori in `team_integration_logs`
