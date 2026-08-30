-- Run only after `supabase migration repair` / remote-history reconciliation.
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
