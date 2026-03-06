-- 20260306130000_add_approval_workflow.sql

-- 1. Create Approval Status Enum
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Idea History with Approval Columns
ALTER TABLE idea_history 
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS feedback_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Update Content Calendar with Approval
ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 4. Set initial status for existing records
-- If an idea was already marked as 'published', we've approved it implicitly
UPDATE idea_history SET approval_status = 'approved' WHERE status = 'published';
UPDATE idea_history SET approval_status = 'draft' WHERE approval_status IS NULL;

-- 5. RLS: Only admins/owners can update the approval_status to 'approved'
-- We'll enforce this primarily in the Server Actions for better UX feedback, 
-- but the DB maintains the team-based access established in previous migrations.
