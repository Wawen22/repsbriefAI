-- 20260305100000_create_shared_strategies.sql
-- Table to store public snapshots of strategies for sharing

CREATE TABLE IF NOT EXISTS shared_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_data JSONB NOT NULL,
  niche TEXT NOT NULL,
  creator_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE shared_strategies ENABLE ROW LEVEL SECURITY;

-- Anyone can read a shared strategy if they have the ID
CREATE POLICY "Anyone can read shared strategies" 
  ON shared_strategies FOR SELECT 
  USING (true);

-- Only authenticated users can create shares
CREATE POLICY "Users can create their own shares" 
  ON shared_strategies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
