-- 20260307153000_align_team_integration_logs_schema.sql
-- Align integration logs schema with webhook engine and upcoming Automation Logs UI.

ALTER TABLE team_integration_logs
  ALTER COLUMN integration_id DROP NOT NULL;

ALTER TABLE team_integration_logs
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success';

-- Backfill provider from linked integrations when available.
UPDATE team_integration_logs logs
SET provider = integrations.provider
FROM team_integrations integrations
WHERE logs.integration_id = integrations.id
  AND logs.provider IS NULL;

-- Backfill generic action/status for historical rows.
UPDATE team_integration_logs
SET action = COALESCE(action, event_type);

UPDATE team_integration_logs
SET status = COALESCE(
  status,
  CASE
    WHEN event_type ILIKE '%error%' THEN 'error'
    ELSE 'success'
  END
);

CREATE INDEX IF NOT EXISTS idx_team_integration_logs_team_created_at
  ON team_integration_logs(team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_integration_logs_provider_status
  ON team_integration_logs(provider, status);
