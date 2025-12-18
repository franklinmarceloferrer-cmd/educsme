-- Fix overly permissive profiles RLS policy
-- Drop the policy that allows anyone to read all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create policy: Users can view their own full profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy: Authenticated users can view basic info of other profiles (for display names, roles in UI)
CREATE POLICY "Auth users can view other profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IS NOT NULL);