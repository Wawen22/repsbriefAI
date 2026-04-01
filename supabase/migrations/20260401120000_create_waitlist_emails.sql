CREATE TABLE IF NOT EXISTS waitlist_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'hero',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (no user-facing access needed)
CREATE POLICY "Service role only" ON waitlist_emails
  USING (false);
