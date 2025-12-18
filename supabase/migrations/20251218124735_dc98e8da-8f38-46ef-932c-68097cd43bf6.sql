-- Make avatars bucket private (requires authentication to access)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';

-- Drop the public access policy
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Create policy for authenticated users to view avatars
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');