-- 20260307170000_add_channel_to_team_webhooks.sql
-- Add delivery channel metadata to support preformatted Slack notifications.

ALTER TABLE team_webhooks
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'generic';

UPDATE team_webhooks
SET channel = 'generic'
WHERE channel IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'team_webhooks_channel_check'
  ) THEN
    ALTER TABLE team_webhooks
      ADD CONSTRAINT team_webhooks_channel_check
      CHECK (channel IN ('generic', 'slack'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_webhooks_team_channel_active
  ON team_webhooks(team_id, channel, active);
