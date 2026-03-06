-- Migration: Add team_id to shared_strategies
-- Description: Links shared strategies to a team for persistent white-label branding.

ALTER TABLE shared_strategies 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Add comment for documentation
COMMENT ON COLUMN shared_strategies.team_id IS 'The workspace that owns this share, used for white-label branding.';
