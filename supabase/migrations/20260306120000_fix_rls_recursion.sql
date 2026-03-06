-- 20260306120000_fix_rls_recursion.sql

-- 1. Create a helper function to break recursion
-- SECURITY DEFINER runs this function with the privileges of the creator (ignoring RLS)
CREATE OR REPLACE FUNCTION public.get_my_teams()
RETURNS SETOF uuid AS $$
BEGIN
  RETURN QUERY
  SELECT team_id 
  FROM public.team_members 
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
DROP POLICY IF EXISTS "Team members can manage team ideas" ON idea_history;

-- 3. Re-create policies using the helper function
-- This avoids recursion because the function bypasses RLS for its internal query

-- Teams: You can see a team if you are a member
CREATE POLICY "Users can view their teams" ON teams FOR SELECT 
  USING (id IN (SELECT get_my_teams()));

-- Team Members: You can see members of teams you belong to
CREATE POLICY "Users can view members of their teams" ON team_members FOR SELECT 
  USING (team_id IN (SELECT get_my_teams()));

-- Idea History: You can manage ideas for teams you belong to
CREATE POLICY "Team members can manage team ideas" ON idea_history FOR ALL 
  USING (team_id IN (SELECT get_my_teams()))
  WITH CHECK (team_id IN (SELECT get_my_teams()));

-- Ensure profiles can see their own team assignment
-- (Already handled by "Users can view own profile", but just in case)
