-- 20260308143000_add_insert_policy_team_integration_logs.sql
-- Allow owner/admin sessions to insert automation/integration logs explicitly.

DROP POLICY IF EXISTS "Admins can insert integration logs" ON team_integration_logs;

CREATE POLICY "Admins can insert integration logs" ON team_integration_logs
FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);
