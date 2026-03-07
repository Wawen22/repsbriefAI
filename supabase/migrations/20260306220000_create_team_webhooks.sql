-- 1. Abilita l'estensione moddatetime
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- 2. Tabella per la configurazione dei Webhooks (Zapier/Make/Custom)
CREATE TABLE IF NOT EXISTS team_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    name TEXT, -- Nome mnemonico (es: "Zapier Marketing")
    events TEXT[] DEFAULT '{idea.approved}', -- Lista eventi: 'brief.ready', 'idea.approved', 'content.scheduled'
    secret TEXT DEFAULT encode(gen_random_bytes(32), 'hex'), -- Per firma HMAC
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE team_webhooks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage webhooks of their team'
    ) THEN
        CREATE POLICY "Users can manage webhooks of their team" ON team_webhooks
        FOR ALL USING (
            team_id IN (
                SELECT team_id FROM team_members WHERE user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 4. Trigger per updated_at
DROP TRIGGER IF EXISTS set_updated_at_webhooks ON team_webhooks;
CREATE TRIGGER set_updated_at_webhooks
    BEFORE UPDATE ON team_webhooks
    FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);
