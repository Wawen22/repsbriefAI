-- Public pages at /s/[id] use the service-role client, so anonymous database
-- reads are unnecessary and expose every share UUID to direct table queries.

DROP POLICY IF EXISTS "Anyone can read shared strategies" ON public.shared_strategies;

CREATE POLICY "Owners and workspace members can read shared strategies"
  ON public.shared_strategies
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR team_id IN (SELECT public.get_my_teams())
  );

-- The queue claim RPC changes job state and must only be callable by trusted
-- server-side workers. Production queue workers use the service-role client.
REVOKE ALL ON FUNCTION public.claim_queue_jobs(text, integer, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_queue_jobs(text, integer, text)
  TO service_role;

-- The following functions use SECURITY DEFINER or run from triggers. Lock their
-- lookup path and remove the default PUBLIC execute grant. `update_team_brand_voice`
-- remains available to signed-in workspace admins because the function enforces
-- membership itself; the trigger function is never a client RPC.
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_team_brand_voice(uuid, text[], text) SET search_path = '';
ALTER FUNCTION public.update_calendar_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

REVOKE ALL ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_team_brand_voice(uuid, text[], text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_team_brand_voice(uuid, text[], text)
  TO authenticated;
