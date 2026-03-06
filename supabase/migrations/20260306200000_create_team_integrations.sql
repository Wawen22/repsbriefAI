-- 20260306200000_create_team_integrations.sql

-- 1. Create Team Integrations Table
CREATE TABLE IF NOT EXISTS team_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'notion', 'google_calendar', etc.
  encrypted_credentials JSONB NOT NULL, -- Access tokens, refresh tokens, etc.
  settings JSONB DEFAULT '{}'::jsonb, -- Integration specific settings (e.g., database_id)
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'error', 'expired'
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, provider)
);

-- 2. Create Integration Logs (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS team_integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES team_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'sync', 'auth_error', 'export_success', etc.
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE team_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_integration_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Only members of the team with 'admin' or 'owner' role can MANAGE integrations
-- All members can VIEW them (to know if they are connected)

CREATE POLICY "Team members can view team integrations" ON team_integrations FOR SELECT
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage team integrations" ON team_integrations FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team members can view integration logs" ON team_integration_logs FOR SELECT
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_integrations_updated_at
    BEFORE UPDATE ON team_integrations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
