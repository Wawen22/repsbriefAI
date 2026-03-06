-- Migration: Add Update Policy for Teams
-- Description: Allows owners and admins to update team branding settings.

-- First, ensure the security definer function exists to avoid recursion (from previous fix)
-- Note: 20260306120000_fix_rls_recursion.sql should have defined it.

CREATE POLICY "Admins and Owners can update teams" 
ON teams FOR UPDATE 
TO authenticated 
USING (
  id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Add policy for idea_history update (ensure branding persistence on shares)
CREATE POLICY "Team members can update shared strategies" 
ON shared_strategies FOR UPDATE 
TO authenticated 
USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);
