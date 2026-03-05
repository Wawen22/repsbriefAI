-- 20260305160000_create_team_invitations.sql

CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Owners/Admins can see invitations for their team
CREATE POLICY "Team managers can view invitations" ON team_invitations FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Owners/Admins can create invitations
CREATE POLICY "Team managers can create invitations" ON team_invitations FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Anyone with the token can view the invitation details (for the join page)
CREATE POLICY "Public can view invitation by token" ON team_invitations FOR SELECT
  USING (status = 'pending');
