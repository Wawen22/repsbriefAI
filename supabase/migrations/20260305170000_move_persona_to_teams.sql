-- 20260305170000_move_persona_to_teams.sql

-- 1. Add columns to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS brand_voice TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS writing_samples TEXT[];

-- 2. Migrate existing data from profiles to their current teams
DO $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN SELECT id, brand_voice, writing_samples, current_team_id FROM profiles WHERE brand_voice IS NOT NULL
  LOOP
    UPDATE teams 
    SET brand_voice = profile_rec.brand_voice, 
        writing_samples = profile_rec.writing_samples
    WHERE id = profile_rec.current_team_id;
  END LOOP;
END $$;

-- 3. Cleanup profiles (optional, keeping columns for now to avoid breaking changes, but logic will shift)
-- COMMENT ON COLUMN profiles.brand_voice IS 'Deprecated: use teams.brand_voice';
