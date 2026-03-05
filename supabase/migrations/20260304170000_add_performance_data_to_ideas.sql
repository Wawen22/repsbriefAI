-- 20260304170000_add_performance_data_to_ideas.sql
-- Add performance tracking columns to idea_history

ALTER TABLE idea_history ADD COLUMN IF NOT EXISTS performance_score INTEGER; -- 1 to 5 stars
ALTER TABLE idea_history ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE idea_history ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE idea_history ADD COLUMN IF NOT EXISTS performance_notes TEXT;
