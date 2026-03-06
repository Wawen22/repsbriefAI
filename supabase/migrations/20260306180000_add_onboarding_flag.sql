-- Migration: Add onboarding flag to profiles
-- Description: Tracks if a user has seen the welcome/tutorial modal.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.has_onboarded IS 'Flag to track if the user has completed the initial onboarding walkthrough.';
