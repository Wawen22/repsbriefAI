-- 20260306190000_add_update_team_brand_voice_rpc.sql
-- Purpose: Robust workspace Brand Voice updates via SECURITY DEFINER RPC.

CREATE OR REPLACE FUNCTION public.update_team_brand_voice(
  p_team_id uuid,
  p_writing_samples text[],
  p_brand_voice text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_owner_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT role
  INTO v_role
  FROM public.team_members
  WHERE team_id = p_team_id
    AND user_id = auth.uid()
  LIMIT 1;

  SELECT owner_id
  INTO v_owner_id
  FROM public.teams
  WHERE id = p_team_id
  LIMIT 1;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Workspace not found';
  END IF;

  IF COALESCE(v_role, '') NOT IN ('owner', 'admin') AND v_owner_id <> auth.uid() THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  UPDATE public.teams
  SET writing_samples = p_writing_samples,
      brand_voice = p_brand_voice
  WHERE id = p_team_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_team_brand_voice(uuid, text[], text) TO authenticated;
