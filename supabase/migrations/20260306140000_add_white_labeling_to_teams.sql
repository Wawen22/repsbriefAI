-- Migration: Add White-labeling fields to Teams
-- Description: Adds logo_url and primary_color for agency branding on shared strategy pages.

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6'; -- Default to blue-500

-- Add comment for documentation
COMMENT ON COLUMN teams.logo_url IS 'URL to the agency logo for white-labeled share pages.';
COMMENT ON COLUMN teams.primary_color IS 'Brand color (hex) for UI accents on white-labeled share pages.';
