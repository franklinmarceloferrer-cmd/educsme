-- Drop the overly permissive policy that exposes email addresses
DROP POLICY IF EXISTS "Auth users can view other profiles" ON public.profiles;

-- Users can still view their own profile via "Users can view own profile" policy
-- For displaying other users' public info (like author names in announcements),
-- the application should use the author_id and display_name stored at creation time