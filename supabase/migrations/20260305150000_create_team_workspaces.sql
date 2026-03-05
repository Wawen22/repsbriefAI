-- 20260305150000_create_team_workspaces.sql

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- 3. Update Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- 4. Update Idea History
ALTER TABLE idea_history ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- 5. Data Migration (Backfill existing users)
-- Create a personal team for every existing profile that doesn't have one
DO $$
DECLARE
  profile_rec RECORD;
  new_team_id UUID;
BEGIN
  FOR profile_rec IN SELECT * FROM profiles WHERE current_team_id IS NULL
  LOOP
    -- Create team
    INSERT INTO teams (name, owner_id) 
    VALUES (COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = profile_rec.id), 'Personal') || '''s Workspace', profile_rec.id)
    RETURNING id INTO new_team_id;

    -- Add as owner
    INSERT INTO team_members (team_id, user_id, role) 
    VALUES (new_team_id, profile_rec.id, 'owner');

    -- Update profile
    UPDATE profiles SET current_team_id = new_team_id WHERE id = profile_rec.id;

    -- Migrate their ideas
    UPDATE idea_history SET team_id = new_team_id WHERE user_id = profile_rec.id AND team_id IS NULL;
  END LOOP;
END $$;

-- 6. RLS Policies for Teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their teams" ON teams FOR SELECT 
  USING (id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view members of their teams" ON team_members FOR SELECT 
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- Allow idea_history to be viewed by team members
DROP POLICY IF EXISTS "Users can manage their own ideas" ON idea_history;
CREATE POLICY "Team members can manage team ideas" ON idea_history FOR ALL 
  USING (
    user_id = auth.uid() OR -- Fallback for safety
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );
