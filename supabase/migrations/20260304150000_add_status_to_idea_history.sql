-- 20260304150000_add_status_to_idea_history.sql
-- Add "status" column to idea_history for Kanban workflow

ALTER TABLE idea_history ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'backlog';

-- Mark existing saved ideas as 'backlog'
UPDATE idea_history SET status = 'backlog' WHERE status IS NULL;
