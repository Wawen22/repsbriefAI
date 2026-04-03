-- Add referral system to profiles
-- referral_code: unique 8-char code shown in dashboard
-- referred_by_code: code of the person who referred this user
-- referral_count: how many successful signups via this user's code

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(8),
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

-- Generate codes for existing users
UPDATE public.profiles
SET referral_code = upper(substring(md5(id::text || clock_timestamp()::text), 1, 8))
WHERE referral_code IS NULL;

-- Ensure all new rows get a code automatically
ALTER TABLE public.profiles
  ALTER COLUMN referral_code SET DEFAULT upper(substring(md5(gen_random_uuid()::text), 1, 8));

-- Index for fast lookups by code
CREATE INDEX IF NOT EXISTS profiles_referral_code_idx ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS profiles_referred_by_code_idx ON public.profiles(referred_by_code);

-- Update handle_new_user trigger to generate referral_code and track referred_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_team_id UUID;
  display_name TEXT;
  ref_code VARCHAR(8);
  referred_by_val VARCHAR(8);
BEGIN
  display_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  -- Generate a unique referral code
  ref_code := upper(substring(md5(new.id::text || clock_timestamp()::text), 1, 8));

  -- Get referred_by from user metadata (passed during signup)
  referred_by_val := new.raw_user_meta_data->>'referred_by';

  -- Create team
  INSERT INTO public.teams (name, owner_id)
  VALUES (display_name || '''s Workspace', new.id)
  RETURNING id INTO new_team_id;

  -- Create team member
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (new_team_id, new.id, 'owner');

  -- Create profile
  INSERT INTO public.profiles (
    id, email, full_name, plan, current_team_id,
    referral_code, referred_by_code
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'starter',
    new_team_id,
    ref_code,
    NULLIF(referred_by_val, '')
  );

  -- Increment referrer's count if applicable
  IF referred_by_val IS NOT NULL AND referred_by_val != '' THEN
    UPDATE public.profiles
    SET referral_count = referral_count + 1
    WHERE referral_code = referred_by_val;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
