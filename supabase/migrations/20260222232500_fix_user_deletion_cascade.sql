-- Drop existing foreign key constraints
ALTER TABLE briefs DROP CONSTRAINT IF EXISTS briefs_user_id_fkey;
ALTER TABLE idea_history DROP CONSTRAINT IF EXISTS idea_history_user_id_fkey;

-- Add them back with ON DELETE CASCADE
ALTER TABLE briefs 
  ADD CONSTRAINT briefs_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE idea_history 
  ADD CONSTRAINT idea_history_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;
