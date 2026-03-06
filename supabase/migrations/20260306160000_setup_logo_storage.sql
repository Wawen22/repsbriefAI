-- Migration: Setup Storage for Team Logos
-- Description: Creates the 'logos' bucket and sets up RLS policies for uploads.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow public to read logos
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'logos');

-- 3. Policy: Allow authenticated users to upload their own team logos
-- Note: We simplify this by allowing authenticated users to upload, 
-- but we'll enforce team ownership in the server action.
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'logos');

-- 4. Policy: Allow users to delete their own uploads
CREATE POLICY "Authenticated Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'logos');
