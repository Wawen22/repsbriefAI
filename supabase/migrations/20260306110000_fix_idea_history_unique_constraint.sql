-- 20260306110000_fix_idea_history_unique_constraint.sql

-- Drop the old user-based unique index
DROP INDEX IF EXISTS idx_idea_history_user_hash;

-- Create a new team-based unique index
-- This ensures that within a workspace, an idea hash is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_idea_history_team_hash ON idea_history(team_id, idea_hash);

-- Update RLS policy to be more robust
DROP POLICY IF EXISTS "Team members can manage team ideas" ON idea_history;
CREATE POLICY "Team members can manage team ideas" ON idea_history FOR ALL 
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  WITH CHECK (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );
