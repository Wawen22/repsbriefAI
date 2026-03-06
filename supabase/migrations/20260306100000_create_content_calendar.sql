-- 20260306100000_create_content_calendar.sql

CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES idea_history(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  platform TEXT NOT NULL DEFAULT 'instagram', -- 'instagram', 'tiktok', 'linkedin', 'youtube'
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'published', 'archived'
  title TEXT NOT NULL,
  hook TEXT,
  script_draft TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

-- Team members can see calendar entries
CREATE POLICY "Team members can view calendar" ON content_calendar FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Team members can create calendar entries
CREATE POLICY "Team members can create calendar" ON content_calendar FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Team members can update calendar entries
CREATE POLICY "Team members can update calendar" ON content_calendar FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Team members can delete calendar entries
CREATE POLICY "Team members can delete calendar" ON content_calendar FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calendar_updated_at_trigger
  BEFORE UPDATE ON content_calendar
  FOR EACH ROW
  EXECUTE PROCEDURE update_calendar_updated_at();
