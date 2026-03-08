-- 20260308100000_add_discord_channel_to_team_webhooks.sql
-- Extend webhook channels to support Discord preformatted deliveries.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'team_webhooks_channel_check'
  ) THEN
    ALTER TABLE team_webhooks
      DROP CONSTRAINT team_webhooks_channel_check;
  END IF;
END $$;

ALTER TABLE team_webhooks
  ADD CONSTRAINT team_webhooks_channel_check
  CHECK (channel IN ('generic', 'slack', 'discord'));

CREATE INDEX IF NOT EXISTS idx_team_webhooks_team_channel_active
  ON team_webhooks(team_id, channel, active);
