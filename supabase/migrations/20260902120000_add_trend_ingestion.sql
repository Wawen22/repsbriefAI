-- Persisted, server-managed trend ingestion. This migration is intentionally versioned only;
-- it must not be applied without the authorized Supabase reconciliation workflow.

CREATE TABLE IF NOT EXISTS public.trend_source_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('youtube', 'rss', 'reddit', 'google-trends')),
  niche TEXT NOT NULL,
  provider_run_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'dead-letter')),
  attempt INTEGER NOT NULL CHECK (attempt > 0),
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  item_count INTEGER CHECK (item_count IS NULL OR item_count >= 0),
  cost_usd NUMERIC(12, 4) CHECK (cost_usd IS NULL OR cost_usd >= 0),
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trend_source_runs_provider_run_key UNIQUE (source, niche, provider_run_id)
);

CREATE INDEX IF NOT EXISTS trend_source_runs_niche_status_started_idx
  ON public.trend_source_runs (niche, status, started_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_trend_source_runs ON public.trend_source_runs;
CREATE TRIGGER set_updated_at_trend_source_runs
  BEFORE UPDATE ON public.trend_source_runs
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TABLE IF NOT EXISTS public.trend_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('youtube', 'rss', 'reddit', 'google-trends')),
  external_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  canonical_url TEXT NOT NULL CHECK (canonical_url ~ '^https://'),
  published_at TIMESTAMPTZ NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  content TEXT,
  score DOUBLE PRECISION,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trend_signals_source_external_id_key UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS trend_signals_canonical_url_idx
  ON public.trend_signals (canonical_url);
CREATE INDEX IF NOT EXISTS trend_signals_content_hash_idx
  ON public.trend_signals (content_hash);
CREATE INDEX IF NOT EXISTS trend_signals_published_at_idx
  ON public.trend_signals (published_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_trend_signals ON public.trend_signals;
CREATE TRIGGER set_updated_at_trend_signals
  BEFORE UPDATE ON public.trend_signals
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TABLE IF NOT EXISTS public.trend_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche TEXT NOT NULL,
  as_of TIMESTAMPTZ NOT NULL,
  signal_ids UUID[] NOT NULL DEFAULT '{}',
  source_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  quality TEXT NOT NULL CHECK (quality IN ('valid', 'invalid')),
  expires_at TIMESTAMPTZ NOT NULL CHECK (expires_at > as_of),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trend_snapshots_latest_valid_idx
  ON public.trend_snapshots (niche, as_of DESC)
  WHERE quality = 'valid';
CREATE INDEX IF NOT EXISTS trend_snapshots_expiry_idx
  ON public.trend_snapshots (expires_at);

CREATE TABLE IF NOT EXISTS public.brief_trend_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  trend_snapshot_id UUID NOT NULL REFERENCES public.trend_snapshots(id) ON DELETE RESTRICT,
  trend_signal_id UUID NOT NULL REFERENCES public.trend_signals(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT brief_trend_evidence_brief_signal_key UNIQUE (brief_id, trend_signal_id)
);

CREATE INDEX IF NOT EXISTS brief_trend_evidence_team_created_idx
  ON public.brief_trend_evidence (team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS brief_trend_evidence_snapshot_idx
  ON public.brief_trend_evidence (trend_snapshot_id);

ALTER TABLE public.trend_source_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_trend_evidence ENABLE ROW LEVEL SECURITY;

-- Ingestion data is server-managed: no browser-facing policy is created for runs, signals or snapshots.
-- Evidence is visible only to a member of the owning team; writes remain service-role only.
DROP POLICY IF EXISTS "Team members can view brief trend evidence" ON public.brief_trend_evidence;
CREATE POLICY "Team members can view brief trend evidence" ON public.brief_trend_evidence
  FOR SELECT
  USING (team_id IN (SELECT public.get_my_teams()));
