-- Add DELETE policy to idea_history
CREATE POLICY "Users can delete own history" ON idea_history FOR DELETE USING (auth.uid() = user_id);
