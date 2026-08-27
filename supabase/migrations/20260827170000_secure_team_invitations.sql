-- Close public invitation disclosure and make acceptance atomic.

ALTER TABLE public.team_invitations
  ADD CONSTRAINT team_invitations_role_check
  CHECK (role IN ('member', 'admin'));

CREATE INDEX IF NOT EXISTS team_members_user_id_idx
  ON public.team_members (user_id);

DROP POLICY IF EXISTS "Public can view invitation by token" ON public.team_invitations;
DROP POLICY IF EXISTS "Team managers can view invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Team managers can create invitations" ON public.team_invitations;

CREATE POLICY "Team managers can view invitations"
  ON public.team_invitations
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (SELECT public.get_my_teams())
    AND EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = team_invitations.team_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team managers can create invitations"
  ON public.team_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (SELECT public.get_my_teams())
    AND EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = team_invitations.team_id
        AND team_members.user_id = (SELECT auth.uid())
        AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE OR REPLACE FUNCTION public.get_my_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT team_id
  FROM public.team_members
  WHERE user_id = (SELECT auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_my_teams() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_teams() TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_team_invitation(
  p_token text,
  p_user_id uuid,
  p_user_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invitation public.team_invitations%ROWTYPE;
BEGIN
  IF p_token IS NULL OR length(p_token) < 32 OR p_user_id IS NULL OR coalesce(trim(p_user_email), '') = '' THEN
    RAISE EXCEPTION 'Invalid invitation request' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO invitation
  FROM public.team_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation is invalid, expired, or already used' USING ERRCODE = 'P0002';
  END IF;

  IF lower(invitation.email) <> lower(trim(p_user_email)) THEN
    RAISE EXCEPTION 'Invitation email does not match the authenticated user' USING ERRCODE = '28000';
  END IF;

  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (invitation.team_id, p_user_id, invitation.role)
  ON CONFLICT (team_id, user_id) DO NOTHING;

  UPDATE public.team_invitations
  SET status = 'accepted'
  WHERE id = invitation.id;

  UPDATE public.profiles
  SET current_team_id = invitation.team_id
  WHERE id = p_user_id;

  RETURN invitation.team_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_team_invitation(text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text, uuid, text) TO service_role;
