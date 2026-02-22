-- supabase/migrations/001_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  active_niche TEXT DEFAULT 'fitness',
  enabled_niches TEXT[] DEFAULT '{fitness}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Briefs table
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  niche TEXT NOT NULL DEFAULT 'fitness',
  week_date DATE NOT NULL,
  ideas JSONB NOT NULL,
  trends_raw JSONB,
  ai_provider TEXT,     -- which provider generated this brief (for logging/debugging)
  ai_model TEXT,        -- which model was used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trends cache table
CREATE TABLE IF NOT EXISTS trends_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  niche TEXT NOT NULL,
  week_date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, niche, week_date)
);

-- Idea history table
CREATE TABLE IF NOT EXISTS idea_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  niche TEXT NOT NULL,
  idea_hash TEXT NOT NULL,
  idea_title TEXT,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: users read/write own rows
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Briefs: users read own briefs
CREATE POLICY "Users can view own briefs" ON briefs FOR SELECT USING (auth.uid() = user_id);

-- Idea History: users read/write own history
CREATE POLICY "Users can view own history" ON idea_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own history" ON idea_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trends Cache: read-only for authenticated users
CREATE POLICY "Authenticated users can view trends" ON trends_cache FOR SELECT TO authenticated USING (true);
