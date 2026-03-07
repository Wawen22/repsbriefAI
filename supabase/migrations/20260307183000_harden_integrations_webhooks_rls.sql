-- 20260307183000_harden_integrations_webhooks_rls.sql
-- Tighten RLS for integration credentials and outbound webhook management.

-- team_integrations: remove member-wide read policy and keep admin-only access.
DROP POLICY IF EXISTS "Team members can view team integrations" ON team_integrations;
DROP POLICY IF EXISTS "Admins can manage team integrations" ON team_integrations;

CREATE POLICY "Admins can manage team integrations" ON team_integrations
FOR ALL
USING (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- team_webhooks: restrict create/read/update/delete to owner/admin only.
DROP POLICY IF EXISTS "Users can manage webhooks of their team" ON team_webhooks;
DROP POLICY IF EXISTS "Admins can manage webhooks of their team" ON team_webhooks;

CREATE POLICY "Admins can manage webhooks of their team" ON team_webhooks
FOR ALL
USING (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);
