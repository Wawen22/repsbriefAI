-- Add "saved" boolean to idea_history to distinguish between:
--   saved=false → inserted automatically during generation for deduplication only
--   saved=true  → explicitly saved by the user (shows in "My Ideas")

ALTER TABLE idea_history ADD COLUMN IF NOT EXISTS saved BOOLEAN DEFAULT false;

-- Mark ALL existing rows as saved=false (dedup entries from generation)
UPDATE idea_history SET saved = false WHERE saved IS NULL;

-- Unique index on (user_id, idea_hash) for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_idea_history_user_hash ON idea_history(user_id, idea_hash);

-- RLS: Allow users to update their own idea_history rows (needed for save/unsave)
CREATE POLICY "Users can update own history" ON idea_history FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
