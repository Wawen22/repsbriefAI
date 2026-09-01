# Audit di Riconciliazione Supabase — Stato al 1 Settembre 2026

## 1. Executive Summary & Metadati di Progetto

- **Data Audit:** 2026-09-01
- **Project ID Supabase:** `qptnloozpjvcqqrfbmnj` (Nome: *RepsBrief*, Regione: `eu-west-1`)
- **PostgreSQL Engine:** 17.6.1.063 (GA channel)
- **Stato Database:** `ACTIVE_HEALTHY`
- **Record in `supabase_migrations.schema_migrations` (remoto):** **6**
- **File di migration nel repository (`supabase/migrations/`):** **38**
- **Verdetto:** **Divergenza di tracciamento critica ma recuperabile.**
  - La maggior parte dello schema applicativo (15 tabelle su 16) è presente in produzione, frutto di esecuzioni DDL manuali o parziali non registrate in `schema_migrations`.
  - **Divergenze di schema bloccanti rilevate:**
    1. La tabella `public.idea_images` e il relativo bucket `idea-images` (da `20260409120000_create_idea_images.sql`) sono **completamente assenti** in remoto.
    2. La tabella `public.teams` è priva delle colonne `brand_voice` (TEXT) e `writing_samples` (TEXT[]), previste da `20260305170000_move_persona_to_teams.sql`.
    3. La function RPC `public.update_team_brand_voice` è presente in remoto con `SECURITY DEFINER`, ma **fallisce a runtime** con errore SQL `column "writing_samples" of relation "teams" does not exist` se invocata.
    4. La tabella `public.idea_history` mantiene policy RLS legacy utente ("Users can view/update/delete own history") ridondanti rispetto alla policy unificata "Team members can manage team ideas".
  - **Regola sul tracking:** **NON inserire indiscriminatamente tutti i 38 identificatori in `schema_migrations`.** Ogni migrazione viene classificata singolarmente secondo il suo stato effettivo.

---

## 2. Tassonomia di Classificazione

Ogni migrazione nel repository appartiene a una di queste 4 categorie:

1. 🟢 **Confermata applicata e riparabile/registrabile:** Oggetti DDL presenti, validati e integri nel DB remoto; la migrazione può essere registrata o marcata come applicata.
2. 🔴 **Mancante e da applicare tramite DDL idempotente autorizzato:** Oggetti DDL mai eseguiti su remoto, da applicare previa autorizzazione.
3. 🟡 **Parzialmente applicata/divergente e da risolvere manualmente:** Alcuni oggetti sono presenti ma altri mancano, oppure esistono divergenze di colonne/policy che impediscono il corretto funzionamento.
4. 🔵 **Superata da migration successive:** La logica, policy o function è stata interamente riscritta o sostituita da una migration successiva.

---

## 3. Tabella Analitica Per-Migration (38 File)

| # | File Migration | Categoria | Stato Oggetti Remoti & Motivazione Tecnica |
| :---: | :--- | :---: | :--- |
| 1 | `001_initial_schema.sql` | 🟢 **1. Confermata applicata** | Tabelle `profiles`, `briefs`, `trends_cache`, `idea_history` ed estensione `uuid-ossp` presenti e conformi. |
| 2 | `20260222214300_add_delete_idea_policy.sql` | 🟢 **1. Confermata applicata** | Policy `Users can delete own history` presente su `idea_history` (registrata su remoto con timestamp `20260222210108`). |
| 3 | `20260222221500_add_idea_data_column.sql` | 🟢 **1. Confermata applicata** | Colonna `idea_history.idea_data` (JSONB) presente (registrata su remoto con timestamp `20260222212027`). |
| 4 | `20260222232000_fix_handle_new_user_trigger.sql` | 🔵 **4. Superata** | Trigger function iniziale `handle_new_user()` (plan='starter') registrata su remoto come `20260222221557`, ma successivamente riscritta dalle migrazioni 34 e 35. |
| 5 | `20260222232500_fix_user_deletion_cascade.sql` | 🟢 **1. Confermata applicata** | Vincoli `briefs_user_id_fkey` e `idea_history_user_id_fkey` con `ON DELETE CASCADE` presenti (registrata come `20260222221957`). |
| 6 | `20260304120000_add_saved_column_to_idea_history.sql` | 🔵 **4. Superata** | Colonna `saved` presente, ma l'indice `idx_idea_history_user_hash` e la RLS sono stati superati e sostituiti dalle migrazioni 15 e 16. |
| 7 | `20260304150000_add_status_to_idea_history.sql` | 🟢 **1. Confermata applicata** | Colonna `idea_history.status` (TEXT DEFAULT 'backlog') presente su remoto. |
| 8 | `20260304160000_add_brand_voice_to_profiles.sql` | 🟢 **1. Confermata applicata** | Colonne `writing_samples` (JSONB) e `brand_voice` (TEXT) presenti in `profiles`. |
| 9 | `20260304170000_add_performance_data_to_ideas.sql` | 🟢 **1. Confermata applicata** | Colonne `performance_score`, `views_count`, `published_at`, `performance_notes` presenti in `idea_history`. |
| 10 | `20260305100000_create_shared_strategies.sql` | 🔵 **4. Superata** | Tabella `shared_strategies` creata, ma RLS e colonna `team_id` sono state ridefinite in 19, 21 e 38. |
| 11 | `20260305150000_create_team_workspaces.sql` | 🔵 **4. Superata** | Tabelle `teams`, `team_members` e colonne create, ma le policy RLS ricorsive sono state sostituite in 16 (`20260306120000`). |
| 12 | `20260305160000_create_team_invitations.sql` | 🔵 **4. Superata** | Tabella `team_invitations` creata, ma la policy pubblica di lettura token è stata rimossa e la sicurezza riscritta in 37 (`20260827170000`). |
| 13 | `20260305170000_move_persona_to_teams.sql` | 🟡 **3. Parzialmente applicata / divergente** | Colonne `brand_voice` e `writing_samples` **assenti** in `public.teams`. Richiede DDL di aggiunta e backfill manuale da `profiles`. |
| 14 | `20260306100000_create_content_calendar.sql` | 🟢 **1. Confermata applicata** | Tabella `content_calendar`, trigger `update_calendar_updated_at` e RLS presenti su remoto. |
| 15 | `20260306110000_fix_idea_history_unique_constraint.sql` | 🔵 **4. Superata** | Indice `idx_idea_history_team_hash` presente; policy team RLS ridefinita con `get_my_teams()` in 16. |
| 16 | `20260306120000_fix_rls_recursion.sql` | 🟢 **1. Confermata applicata** | Funzione helper `get_my_teams()` e policy non-ricorsive su `teams`, `team_members`, `idea_history` attive. |
| 17 | `20260306130000_add_approval_workflow.sql` | 🟢 **1. Confermata applicata** | Tipo enum `approval_status`, colonne `approval_status`, `reviewer_id`, `feedback_notes` in `idea_history` e `is_approved` in `content_calendar` presenti. |
| 18 | `20260306140000_add_white_labeling_to_teams.sql` | 🟢 **1. Confermata applicata** | Colonne `logo_url` e `primary_color` presenti in `public.teams`. |
| 19 | `20260306150000_add_team_id_to_shared_strategies.sql` | 🟢 **1. Confermata applicata** | Colonna `shared_strategies.team_id` (FK verso `teams`) presente su remoto. |
| 20 | `20260306160000_setup_logo_storage.sql` | 🟢 **1. Confermata applicata** | Bucket storage `logos` (public) e relative 3 storage policy presenti su remoto. |
| 21 | `20260306170000_add_team_update_policy.sql` | 🟢 **1. Confermata applicata** | Policy UPDATE su `teams` (`Admins and Owners can update teams`) e `shared_strategies` attive. |
| 22 | `20260306180000_add_onboarding_flag.sql` | 🟢 **1. Confermata applicata** | Colonna `profiles.has_onboarded` (BOOLEAN DEFAULT false) presente. |
| 23 | `20260306190000_add_update_team_brand_voice_rpc.sql` | 🟡 **3. Parzialmente applicata / divergente** | RPC `update_team_brand_voice` installata nel DB ma fallisce a runtime perché le colonne in `teams` (da migration 13) non esistono. |
| 24 | `20260306200000_create_team_integrations.sql` | 🔵 **4. Superata** | Tabelle `team_integrations` e `team_integration_logs` create, ma schema logs allineato in 27 e RLS hardenata in 29 e 31. |
| 25 | `20260306210000_add_metadata_to_calendar.sql` | 🟢 **1. Confermata applicata** | Colonna `content_calendar.metadata` e indice GIN `idx_content_calendar_metadata` presenti. |
| 26 | `20260306220000_create_team_webhooks.sql` | 🔵 **4. Superata** | Tabella `team_webhooks` presente, ma RLS e vincoli `channel` evoluti nelle migrazioni 28, 29 e 30. |
| 27 | `20260307153000_align_team_integration_logs_schema.sql` | 🟢 **1. Confermata applicata** | Colonne `provider`, `action`, `status` e indici compositi presenti su `team_integration_logs`. |
| 28 | `20260307170000_add_channel_to_team_webhooks.sql` | 🔵 **4. Superata** | Colonna `channel` aggiunta con check ('generic', 'slack'), successivamente allargata a ('discord') in 30. |
| 29 | `20260307183000_harden_integrations_webhooks_rls.sql` | 🟢 **1. Confermata applicata** | RLS ristretta solo a owner/admin per `team_integrations` e `team_webhooks` attiva su remoto. |
| 30 | `20260308100000_add_discord_channel_to_team_webhooks.sql` | 🟢 **1. Confermata applicata** | Check constraint `team_webhooks_channel_check` ('generic', 'slack', 'discord') e indice composito attivi. |
| 31 | `20260308143000_add_insert_policy_team_integration_logs.sql` | 🟢 **1. Confermata applicata** | Policy INSERT `Admins can insert integration logs` attiva su `team_integration_logs`. |
| 32 | `20260309123000_add_job_queue_spike.sql` | 🟢 **1. Confermata applicata** | Tabelle `job_queue`, `job_dead_letters`, indici, trigger e RPC `claim_queue_jobs` presenti. |
| 33 | `20260401120000_create_waitlist_emails.sql` | 🟢 **1. Confermata applicata** | Tabella `waitlist_emails`, vincolo unique e policy service-role only presenti. |
| 34 | `20260402100000_fix_handle_new_user_create_workspace.sql` | 🔵 **4. Superata** | Trigger auto-creazione workspace su signup, superato e arricchito dal referral system in 35. |
| 35 | `20260403120000_add_referral_system.sql` | 🟢 **1. Confermata applicata** | Colonne `referral_code`, `referred_by_code`, `referral_count`, indici e trigger function finale `handle_new_user()` presenti. |
| 36 | `20260409120000_create_idea_images.sql` | 🔴 **2. Mancante** | Tabella `idea_images`, RLS, bucket `idea-images` e 4 storage policies **completamente assenti**. |
| 37 | `20260827170000_secure_team_invitations.sql` | 🟢 **1. Confermata applicata** | Check constraint ruolo, RLS hardenata, RPC `accept_team_invitation` (registrata su remoto come `20260827143650`). |
| 38 | `20260830095438_harden_revenue_launch_access.sql` | 🟢 **1. Confermata applicata** | RLS share pubbliche, revoke `claim_queue_jobs`, lock `search_path = ''` su funzioni (registrata come `20260830095438`). |

---

## 4. Matrice Comparativa di Schema, RLS, Storage e Funzioni

### 4.1 Tabelle Pubbliche (16 target vs 15 attuali)

| Tabella | Nel Repo | Su Remoto | Discrepanze / Note |
| :--- | :---: | :---: | :--- |
| `profiles` | ✅ | ✅ | 16 colonne conformi. Contiene ancora `brand_voice` e `writing_samples` legacy |
| `briefs` | ✅ | ✅ | 9 colonne conformi, FK CASCADE attiva |
| `trends_cache` | ✅ | ✅ | 6 colonne conformi, unique constraint `(source, niche, week_date)` attivo |
| `idea_history` | ✅ | ✅ | 18 colonne conformi, compresi `approval_status` (enum) e tracking performance |
| `shared_strategies` | ✅ | ✅ | 7 colonne conformi, collegata a `team_id` |
| `teams` | ✅ | ⚠️ | **Mancano 2 colonne:** `brand_voice` (TEXT) e `writing_samples` (TEXT[]) (Cat. 3) |
| `team_members` | ✅ | ✅ | 5 colonne conformi, unique constraint `(team_id, user_id)` attivo |
| `team_invitations` | ✅ | ✅ | 8 colonne conformi, check role `('member', 'admin')` attivo |
| `content_calendar` | ✅ | ✅ | 14 colonne conformi, compresi `is_approved` e `metadata` (GIN index) |
| `team_integrations` | ✅ | ✅ | 9 colonne conformi, unique constraint `(team_id, provider)` attivo |
| `team_integration_logs` | ✅ | ✅ | 9 colonne conformi, `integration_id` nullable, `provider`/`status` indici attivi |
| `team_webhooks` | ✅ | ✅ | 10 colonne conformi, check channel `('generic', 'slack', 'discord')` attivo |
| `job_queue` | ✅ | ✅ | 15 colonne conformi, indici parziali di deduplica e cron attivi |
| `job_dead_letters` | ✅ | ✅ | 9 colonne conformi, FK SET NULL / CASCADE attive |
| `waitlist_emails` | ✅ | ✅ | 4 colonne conformi, unique su `email` |
| `idea_images` | ✅ | ❌ | **TABELLA TOTALMENTE ASSENTE SU REMOTO** (Cat. 2) |

### 4.2 Storage Buckets e Policy

| Bucket | Nel Repo | Su Remoto | Public | Storage Policies Attive |
| :--- | :---: | :---: | :---: | :--- |
| `logos` | ✅ | ✅ | `true` | Public Read (`Public Access`), Authenticated Insert (`Authenticated Upload`), Authenticated Delete (`Authenticated Delete`) |
| `idea-images` | ✅ | ❌ | `true` | **Mancano tutte e 4 le policy:** Public Read, Authenticated Upload, Delete, Update (Cat. 2) |

### 4.3 PL/pgSQL Function, RPC e Triggers

| Function | Signature | Security | search_path | Execute Grants | Stato Remoto |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `handle_new_user` | `() RETURNS trigger` | `SECURITY DEFINER` | `""` (vuoto) | `service_role` (REVOKED da PUBLIC/anon/authenticated) | **Conforme** (versione 35) |
| `get_my_teams` | `() RETURNS SETOF uuid` | `SECURITY DEFINER` | `""` (vuoto) | `authenticated` | **Conforme** (versione 37) |
| `accept_team_invitation` | `(text, uuid, text) RETURNS uuid` | `SECURITY DEFINER` | `""` (vuoto) | `service_role` | **Conforme** (versione 37) |
| `claim_queue_jobs` | `(text, int4, text) RETURNS SETOF job_queue` | `SECURITY DEFINER` | `public` | `service_role` | **Conforme** (versione 38) |
| `update_team_brand_voice` | `(uuid, text[], text) RETURNS void` | `SECURITY DEFINER` | `""` (vuoto) | `authenticated` | ⚠️ **FALLISCE**: mancano colonne `teams` (Cat. 3) |
| `update_calendar_updated_at` | `() RETURNS trigger` | Invoker | `""` (vuoto) | Default | **Conforme** |
| `update_updated_at_column` | `() RETURNS trigger` | Invoker | `""` (vuoto) | Default | **Conforme** |

---

## 5. Comandi Read-Only per Verifica Indipendente

I seguenti comandi sono non-distruttivi e possono essere eseguiti in qualsiasi momento via Supabase Dashboard SQL Editor o CLI:

```sql
-- 1. Verifica versioni registrate in remoto
SELECT version, name, created_at, created_by 
FROM supabase_migrations.schema_migrations 
ORDER BY version ASC;

-- 2. Verifica presenza tabelle in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Verifica colonne della tabella teams
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'teams' 
ORDER BY ordinal_position;

-- 4. Verifica stato bucket storage
SELECT id, name, public, created_at 
FROM storage.buckets;

-- 5. Verifica policy RLS attive
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 6. Verifica funzioni e search_path
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
WHERE pg_namespace.nspname = 'public';
```

---

## 6. Piano di Riconciliazione Sicura (Per Fasi Verificate)

> [!IMPORTANT]
> **Nessuna modifica a `schema_migrations` o DDL va eseguita senza esplicita autorizzazione dell'utente.**
> Il piano garantisce che ogni voce venga verificata singolarmente prima di essere marcata come allineata.

### Fase 1: Snapshot di Sicurezza (Pre-Reconciliation)
Eseguire un backup logico completo o esportazione dello schema da Supabase Dashboard.

### Fase 2: Risoluzione Manuale delle Divergenze (Categoria 3)
Risolvere la divergenza di `public.teams` e `update_team_brand_voice`:

```sql
-- Aggiungi colonne mancanti a teams (Migration 13)
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS brand_voice TEXT,
  ADD COLUMN IF NOT EXISTS writing_samples TEXT[];

-- Backfill sicuro da profiles dove presente
UPDATE public.teams t
SET brand_voice = p.brand_voice
FROM public.profiles p
WHERE p.current_team_id = t.id 
  AND p.brand_voice IS NOT NULL 
  AND t.brand_voice IS NULL;
```

### Fase 3: Applicazione DDL Idempotente per Elementi Mancanti (Categoria 2)
Applicare la migrazione `20260409120000_create_idea_images.sql`:

```sql
-- Crea tabella idea_images
CREATE TABLE IF NOT EXISTS public.idea_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_history_id UUID NOT NULL REFERENCES public.idea_history(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (idea_history_id)
);

ALTER TABLE public.idea_images ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'idea_images' AND policyname = 'Users manage own idea images') THEN
    CREATE POLICY "Users manage own idea images"
      ON public.idea_images FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Crea bucket storage idea-images e policy
INSERT INTO storage.buckets (id, name, public)
VALUES ('idea-images', 'idea-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND policyname = 'Public read idea images') THEN
    CREATE POLICY "Public read idea images" ON storage.objects FOR SELECT USING (bucket_id = 'idea-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND policyname = 'Authenticated upload idea images') THEN
    CREATE POLICY "Authenticated upload idea images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'idea-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND policyname = 'Authenticated delete idea images') THEN
    CREATE POLICY "Authenticated delete idea images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'idea-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND policyname = 'Authenticated update idea images') THEN
    CREATE POLICY "Authenticated update idea images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'idea-images');
  END IF;
END $$;
```

### Fase 4: Esecuzione Test di Validazione Post-DDL
Eseguire la suite statica SQL `supabase/tests/2026-09-01-reconciliation-verification.sql`.  
Tutti i controlli devono risultare superati (16 tabelle, colonne `teams.brand_voice`, 2 bucket, funzioni e permessi).

### Fase 5: Riconciliazione Puntuale di `schema_migrations` (Item-by-Item)
Solo **dopo** che le Fasi 2, 3 e 4 sono completate e verificate:
1. Registrare le versioni delle migrazioni di Categoria 1, Categoria 2 e Categoria 3 risolte.
2. Per le 6 migrazioni già registrate con timestamp differente (es. `20260222210108`, `20260827143650`), mantenere o normalizzare le chiavi di versione in accordo con la CLI Supabase scelta per i deploy futuri.
3. Per le migrazioni di Categoria 4 (Superate), registrare la versione solo se strettamente richiesto dal runner CLI per marcare la cronologia completa senza re-esecuzione.

---

## 7. Piano di Rollback

Se durante l'applicazione del delta DDL si riscontrassero anomalie:

```sql
-- Rollback Delta DDL
-- 1. Rimozione policy storage idea-images
DROP POLICY IF EXISTS "Public read idea images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload idea images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete idea images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update idea images" ON storage.objects;

-- 2. Rimozione bucket idea-images
DELETE FROM storage.buckets WHERE id = 'idea-images';

-- 3. Rimozione tabella idea_images
DROP TABLE IF EXISTS public.idea_images;

-- 4. Rimozione colonne teams
ALTER TABLE public.teams 
  DROP COLUMN IF EXISTS brand_voice,
  DROP COLUMN IF EXISTS writing_samples;
```

---

## 8. Test Suite Post-Reconciliation

La suite SQL statica in `supabase/tests/2026-09-01-reconciliation-verification.sql` valida:
1. Esistenza delle 16 tabelle.
2. Presenza delle colonne critiche (`teams.brand_voice`, `profiles.referral_code`, ecc.).
3. Presenza dei 2 bucket storage (`logos`, `idea-images`).
4. Integrità delle funzioni `SECURITY DEFINER` e permessi RPC.
