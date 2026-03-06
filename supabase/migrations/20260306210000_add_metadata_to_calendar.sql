-- Aggiunta colonna metadata a content_calendar per integrazioni esterne
ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Indice per velocizzare le query sui metadati (es: ricerca per google_event_id)
CREATE INDEX IF NOT EXISTS idx_content_calendar_metadata ON content_calendar USING gin (metadata);
