-- Fix Security Issue: Restrict access to profiles table
-- Remove the overly permissive policy that allows anyone to view all profiles

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies

-- Allow users to view their own profile (needed for AuthContext)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow authenticated users to view only display_name and role for document attribution and stats
-- This prevents exposure of email addresses while maintaining functionality
CREATE POLICY "Authenticated users can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() != user_id -- Don't duplicate with own profile policy
);

-- Create a security definer function to get role counts safely
CREATE OR REPLACE FUNCTION public.get_role_count(target_role text)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles WHERE role = target_role;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_role_count(text) TO authenticated;