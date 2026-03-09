-- 20260309123000_add_job_queue_spike.sql
-- P4.3 Queue/Jobs spike: add queue + dead-letter tables and claim function for workers.

CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'dead')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  last_error TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_queue_status_available
  ON job_queue(status, available_at);

CREATE INDEX IF NOT EXISTS idx_job_queue_team_status
  ON job_queue(team_id, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_queue_dedupe_active
  ON job_queue(team_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL AND status IN ('pending', 'processing');

DROP TRIGGER IF EXISTS set_updated_at_job_queue ON job_queue;
CREATE TRIGGER set_updated_at_job_queue
  BEFORE UPDATE ON job_queue
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TABLE IF NOT EXISTS job_dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_queue(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error TEXT,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_dead_letters_team_created
  ON job_dead_letters(team_id, created_at DESC);

ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_dead_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view queue jobs" ON job_queue;
DROP POLICY IF EXISTS "Admins can manage queue jobs" ON job_queue;
DROP POLICY IF EXISTS "Team members can view dead letters" ON job_dead_letters;
DROP POLICY IF EXISTS "Admins can manage dead letters" ON job_dead_letters;

CREATE POLICY "Team members can view queue jobs" ON job_queue
FOR SELECT
USING (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage queue jobs" ON job_queue
FOR ALL
USING (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Team members can view dead letters" ON job_dead_letters
FOR SELECT
USING (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage dead letters" ON job_dead_letters
FOR ALL
USING (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

DROP FUNCTION IF EXISTS claim_queue_jobs(TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION claim_queue_jobs(
  p_worker TEXT,
  p_limit INTEGER DEFAULT 10,
  p_job_type TEXT DEFAULT NULL
)
RETURNS SETOF job_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT id
    FROM job_queue
    WHERE status = 'pending'
      AND available_at <= NOW()
      AND (p_job_type IS NULL OR job_type = p_job_type)
    ORDER BY available_at ASC, created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT GREATEST(p_limit, 1)
  ),
  updated AS (
    UPDATE job_queue q
    SET
      status = 'processing',
      locked_at = NOW(),
      locked_by = COALESCE(NULLIF(p_worker, ''), 'worker'),
      attempts = q.attempts + 1,
      updated_at = NOW()
    WHERE q.id IN (SELECT id FROM candidates)
    RETURNING q.*
  )
  SELECT * FROM updated;
END;
$$;

GRANT EXECUTE ON FUNCTION claim_queue_jobs(TEXT, INTEGER, TEXT) TO authenticated, service_role;
