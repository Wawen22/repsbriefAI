-- Fix: handle_new_user trigger now auto-creates a personal workspace
-- so that new users always have a current_team_id set immediately after signup.

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  new_team_id UUID;
  display_name TEXT;
BEGIN
  display_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- Create personal workspace
  INSERT INTO public.teams (name, owner_id)
  VALUES (display_name || '''s Workspace', new.id)
  RETURNING id INTO new_team_id;

  -- Add user as owner
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (new_team_id, new.id, 'owner');

  -- Create profile with team already set
  INSERT INTO public.profiles (id, email, full_name, plan, current_team_id)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'starter', new_team_id);

  RETURN new;
END;
$function$;

-- Backfill: create workspace for any existing user that still has current_team_id = NULL
DO $$
DECLARE
  profile_rec RECORD;
  new_team_id UUID;
  display_name TEXT;
BEGIN
  FOR profile_rec IN
    SELECT p.id, u.email, u.raw_user_meta_data->>'full_name' AS full_name
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.current_team_id IS NULL
  LOOP
    display_name := COALESCE(profile_rec.full_name, split_part(profile_rec.email, '@', 1));

    INSERT INTO public.teams (name, owner_id)
    VALUES (display_name || '''s Workspace', profile_rec.id)
    RETURNING id INTO new_team_id;

    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (new_team_id, profile_rec.id, 'owner')
    ON CONFLICT DO NOTHING;

    UPDATE public.profiles SET current_team_id = new_team_id WHERE id = profile_rec.id;

    UPDATE public.idea_history SET team_id = new_team_id
    WHERE user_id = profile_rec.id AND team_id IS NULL;
  END LOOP;
END $$;
