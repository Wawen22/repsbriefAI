# Audit RepsBrief — stato al 1 settembre 2026

> Aggiornamento operativo: 1 settembre 2026. Questa baseline conserva i
> rilievi originali; le checkbox sotto riflettono esclusivamente gli interventi
> integrati e validati localmente. I gate di produzione restano aperti finché
> non sono verificati nel deploy live.

## Scopo e snapshot

Questo documento è la baseline operativa per i prossimi worktree. Descrive lo
stato verificato del repository e del prodotto live al 1 settembre 2026; non
autorizza modifiche a produzione, migration o segreti.

**Verdetto:** RepsBrief è un MVP avanzato e presentabile, ma non è ancora
pronto per acquisizione paid-beta. Il primo rischio non è la UI: è la qualità,
tracciabilità e veridicità dei dati trend rispetto alle promesse commerciali.

| Area | Stato | Valutazione |
| --- | --- | ---: |
| UI, dashboard e billing | Solida | 8/10 |
| AI abstraction e TypeScript | Buona | 8/10 |
| Team, integrazioni e automazioni | MVP avanzato, non validato end-to-end | 6/10 |
| Scraping e qualità trend | Fragile | 3/10 |
| Copy e conversione | Non allineati al prodotto reale | 4/10 |
| Sicurezza e dipendenze | Hardening avviato, incompleto | 5/10 |
| Test e osservabilità | Base presente, copertura insufficiente sui flussi critici | 5/10 |
| Readiness commerciale | Non pronta | 4/10 |

## Evidenze verificate

- Il worktree era pulito all'inizio e al termine dell'audit.
- `https://repsbrief.com` ha risposto `200` da Vercel; `/api/stats` ha
  restituito `briefCount: 23` durante l'audit.
- I test locali eseguiti hanno superato: 10 file / 38 test unitari e 1 smoke
  e2e di import route.
- `pnpm` è ora il package manager canonico (`packageManager: pnpm@11.25.0`):
  install frozen, 74 test, typecheck, lint e build placeholder sono passati.
  Il precedente doppio lockfile npm/pnpm è stato eliminato per evitare derive
  di versioni tra locale e Vercel.
- `npm audit --omit=dev` ha rilevato 24 vulnerabilità: 1 critical, 9 high,
  13 moderate e 1 low. I pacchetti da aggiornare con un lavoro dedicato sono
  principalmente Next.js, axios, jsPDF, sharp, PostCSS e dipendenze Sentry.

## Stato architetturale

### Punti solidi

- Le chiamate AI testuali usano `getAIProvider()` in `src/lib/ai/index.ts`.
- Le configurazioni per nicchia sono concentrate in `src/config/niches.ts`.
- Il trend-quality gate blocca la generazione quando i dati sono vuoti,
  malformati o stale, evitando brief inventati.
- Il webhook Stripe valida la firma e il credito referral usa una idempotency
  key.
- Le migration recenti rafforzano accesso a share pubbliche, function SQL e
  queue.

### Debito architetturale rilevante

- La storia delle migration nel repository non è riconciliata con Supabase
  remoto. **Non applicare migration** prima di un confronto di baseline e di
  una migration repair esplicitamente autorizzata.
- Il modello team-first è ancora parziale: i brief rimangono user-scoped. La
  generazione Brand Voice ora usa però il team corrente e non fallback legacy
  sul profilo.
- I flussi share sono stati consolidati su `/s/[id]`; il referral usa ora un
  Route Handler dedicato `/r/[code]`.
- `updateActiveNicheAction` ora limita la scelta alle nicchie attive
  configurate.

## Scraping: stato reale e decisione Apify

### Configurazione corrente

Le uniche fonti abilitate sono `youtube` e `rss`. Reddit e Google Trends
restano implementati ma disabilitati, scelta corretta vista l'inaffidabilità
già osservata. La generazione può procedere se almeno una fonte attiva fornisce
trend freschi e validi.

### Verifica dei feed RSS configurati

| Feed | Esito live il 2026-09-01 |
| --- | --- |
| Examine | `429` |
| Stronger by Science | `200`, RSS valido |
| Renaissance Periodization | `404` |
| T-Nation | `404` |

Di quattro feed, uno soltanto era disponibile durante il controllo. YouTube
può coprire una parte del fabbisogno, ma non esistono timeout, retry
strutturati, circuit breaker, health metrics o una persistenza dell'errore per
sorgente.

### Limiti da correggere

- Lo scraping avviene anche nella richiesta di generazione dell'utente: è
  lento e rischia il timeout.
- Il punteggio YouTube è il totale view, non la view velocity dichiarata dalla
  UI.
- Nel prompt AI arrivano soprattutto titoli; URL e contenuto non sono
  tracciati fino all'idea. La categoria `sources` è dichiarata dal modello,
  non è una citazione verificabile.
- `briefs.trends_raw` non viene popolato: non esiste un audit trail del trend
  che ha generato una strategia.
- Una singola sorgente valida supera il quality gate: evita l'invenzione, ma
  non assicura varietà o qualità editoriale.

### Decisione

**Adottare Apify, ma come ingestion asincrona e osservabile, non dentro la
request di generazione.** Mantenere l'API ufficiale YouTube come fonte nativa
finché risulta affidabile; usare Apify per Reddit e Google Trends/Search
Trends, dopo un benchmark minimo di affidabilità, schema e costo degli Actor.

Architettura obiettivo:

```text
Apify Tasks / cron → adapter normalizzati → source runs + trends snapshot
→ freshness / diversity / health score → quality gate → brief con evidenze
```

Configurazione iniziale da preparare (senza committare segreti):

- [ ] `APIFY_TOKEN` in Vercel e negli ambienti necessari.
- [ ] Un Task Reddit per le community fitness definite in `niches.ts`.
- [ ] Un Task Google Trends o Google Search Trends con output normalizzabile.
- [ ] Benchmark di almeno due Actor candidati per costo/run, campi disponibili,
  tasso di successo e compliance.
- [ ] Soglie esplicite: fonte sana, data massima, numero minimo di item,
  numero minimo di fonti e fallback.

## Rischi di prodotto e conversione

### P0 — da correggere prima di acquisizione

- [x] Landing, dashboard, loading state ed e-mail non dichiarano più Reddit,
  Google Trends, PubMed citations, transcript o real-time scraping non
  disponibili nella pipeline attiva.
- [x] La copy Pro non descrive più "daily automated briefs" quando il cron di
  generazione è settimanale; comunica correttamente la generazione manuale.
- [x] Il cron e-mail del lunedì filtra gli Starter ai brief creati nel giorno,
  evitando notifiche per brief storici.
- [x] Il mittente e-mail è centralizzato su `RESEND_FROM_EMAIL` e fallisce
  chiuso in produzione; resta necessario verificare il dominio Resend e
  configurare la variabile su Vercel.
- [x] `/r/[code]` usa un Route Handler per impostare il cookie e redirigere,
  senza mutare cookie durante il rendering di una Server Component.

### P1 — sicurezza, costi e affidabilità

- [x] Validazione Zod, limiti input, controllo piano e rate limit server-side
  per AI Remix, Brand Voice e image generation.
- [x] Download immagini del provider protetto fail-closed: accetta solo data
  URL raster PNG/JPEG/WebP fino a 10 MiB; URL remoti disabilitati finché non
  esiste DNS pinning verificabile.
- [ ] Upgrade dipendenze vulnerabili con test, senza `npm audit fix --force`.
- [ ] Sentry/alerting su errore sorgente, freshness cache, errore AI, webhook
  Stripe, fallimento e-mail e queue dead-letter.
- [ ] Test reali con mock di Supabase/Stripe/Resend/Apify, non solo import
  smoke.

### P2 — dopo il paid-beta proof

- [ ] Analytics funnel: signup → brief valido → quinta idea → trial → paid.
- [ ] Team collaboration end-to-end con almeno un workspace pilota.
- [ ] Publishing connector e nuove nicchie solo dopo retention dei creator
  fitness.

## Sequenza operativa approvata

1. [x] Correggere truthfulness, e-mail, referral e cron.
2. [ ] Stabilizzare feed esistenti e introdurre pipeline Apify asincrona.
3. [ ] Aggiungere provenance del trend, test e osservabilità.
4. [ ] Hardening costi/sicurezza completato; remediation delle dipendenze
   vulnerabili ancora aperta.
5. [ ] Audit Supabase completato; riconciliazione remota ancora bloccata da
   backup e Delta DDL autorizzato.
6. [ ] Eseguire smoke test live completo, poi reclutare 10 creator fitness.

## Worktree consigliati e prompt ORCA ADE

### 1. `fix/revenue-truthfulness` — completato e integrato

```text
Leggi integralmente AGENTS.md, PROJECT_CONTEXT.md e docs/audits/2026-09-01-repsbrief-audit.md. Implementa il revenue-truthfulness hardening senza cambiare il modello dati.

Allinea landing, dashboard loading states, FAQ, pricing, sample brief ed e-mail alle sole fonti attive reali. Non citare Reddit, Google Trends, PubMed, transcript, real-time o automazioni non disponibili. Centralizza il mittente su RESEND_FROM_EMAIL, senza fallback onboarding@resend.dev in produzione. Correggi il cron engagement affinché Starter non riceva brief-ready per brief storici. Sposta /r/[code] in un Route Handler che imposta il cookie e redirige. Unifica i due flussi public share mantenendo /s/[id] canonico. Aggiungi test mirati.

Non applicare migration. Mantieni TypeScript e AI abstraction. Aggiorna PROJECT_CONTEXT.md; se INIT_PROMPT.md è ancora assente, crealo con checklist e link a questo audit. Esegui test, typecheck, lint e build.
```

### 2. `feat/apify-trend-ingestion` — ancora da avviare

```text
Leggi integralmente AGENTS.md, PROJECT_CONTEXT.md e docs/audits/2026-09-01-repsbrief-audit.md. Implementa una pipeline TypeScript di ingestion trend affidabile, con Apify opzionale e mai nella request utente di generazione.

Definisci adapter normalizzati; conserva YouTube e RSS con timeout, retry limitati, deduplica, error capture e health metrics. Introduci APIFY_TOKEN e configurazione Actor/Task senza hardcode di dati nicchia fuori da src/config/niches.ts. Prepara source-run/trend snapshot, freshness, quality/diversity thresholds e provenance nel brief. Non applicare migration finché la storia Supabase non è riconciliata: prepara solo migration e documentazione. Aggiungi test per normalizzazione, fallback e freshness. Documenta benchmark e Task Apify richiesti.

Aggiorna PROJECT_CONTEXT.md; se INIT_PROMPT.md è ancora assente, crealo con checklist e link a questo audit. Esegui la verifica completa.
```

### 3. `fix/security-cost-controls` — completato e integrato

```text
Leggi integralmente AGENTS.md, PROJECT_CONTEXT.md e docs/audits/2026-09-01-repsbrief-audit.md. Esegui hardening mirato di sicurezza e controllo costi.

Aggiungi validazione Zod, limiti di dimensione, controlli piano e rate limit server-side a Remix, Brand Voice e image generation. Rendi sicuro il download immagine con timeout, limite byte, content-type e anti-SSRF. Valida active_niche contro NICHES attive. Correggi Brand Voice affinché la generazione usi il team corrente. Rimuovi fallback legacy che mascherano problemi di schema. Aggiorna dipendenze vulnerabili con upgrade controllato, mai npm audit fix --force. Aggiungi test di autorizzazione, piano e input.

Non applicare migration Supabase. Aggiorna PROJECT_CONTEXT.md; se INIT_PROMPT.md è ancora assente, crealo con checklist e link a questo audit. Esegui test, typecheck, lint, build e audit.
```

### 4. `chore/supabase-baseline-audit` — completato e integrato (solo audit)

```text
Leggi integralmente AGENTS.md, PROJECT_CONTEXT.md, docs/audits/2026-09-01-repsbrief-audit.md e tutte le migration Supabase. Produci un audit di riconciliazione tra repository e ambiente remoto.

Non applicare migration e non usare migration repair senza autorizzazione esplicita. Elenca baseline, ordine sicuro, schema/RLS/function da confrontare, comandi read-only, divergenze, rollback e test post-reconciliation. Crea solo documentazione e test SQL statici se utili.

Aggiorna PROJECT_CONTEXT.md; se INIT_PROMPT.md è ancora assente, crealo con checklist e link a questo audit.
```

## Gate prima del primo cohort

- [ ] Sender domain Resend verificato e tutte le e-mail inviate da esso.
- [x] Copy nel ramo integrato coerente con fonti e entitlement realmente
  disponibili; verificare il deploy Vercel prima di considerarlo live.
- [ ] Pipeline trend con almeno due fonti sane o fallback trasparente.
- [ ] Signup → referral → Starter brief → Pro checkout → webhook →
  cancellation verificati in produzione.
- [ ] Migration history Supabase riconciliata.
- [ ] Nessuna vulnerabilità critical/high non valutata con remediation plan.
- [ ] Metriche funnel e alerting attivi.
