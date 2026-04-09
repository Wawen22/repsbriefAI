-- supabase/migrations/20260409120000_create_idea_images.sql

-- 1. Table
CREATE TABLE IF NOT EXISTS idea_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  idea_history_id UUID NOT NULL REFERENCES idea_history(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (idea_history_id)
);

-- 2. RLS
ALTER TABLE idea_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own idea images"
ON idea_images FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('idea-images', 'idea-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read idea images"
ON storage.objects FOR SELECT
USING (bucket_id = 'idea-images');

CREATE POLICY "Authenticated upload idea images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'idea-images');

CREATE POLICY "Authenticated delete idea images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'idea-images');

CREATE POLICY "Authenticated update idea images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'idea-images');
