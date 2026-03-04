-- 20260304160000_add_brand_voice_to_profiles.sql
-- Store user's writing samples and the AI-analyzed brand voice profile

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS writing_samples JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_voice TEXT;
