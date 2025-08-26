-- Create demo users for EduCMS
-- This migration creates the demo users shown on the login page
-- Note: This uses the auth.users table directly, which requires service role permissions

-- Insert demo users into auth.users table
-- Note: In production, users should be created through the signup flow
-- This is only for demo/development purposes

-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@edu-cms.com',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "System Administrator", "role": "admin"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create teacher user  
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'teacher@edu-cms.com',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Demo Teacher", "role": "teacher"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create student user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'student@edu-cms.com',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Demo Student", "role": "student"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- The profiles will be created automatically by the handle_new_user() trigger
-- But let's ensure they exist with the correct roles

-- Insert profiles for demo users (in case trigger didn't fire)
INSERT INTO public.profiles (user_id, display_name, email, role)
SELECT 
  u.id,
  u.raw_user_meta_data->>'display_name',
  u.email,
  u.raw_user_meta_data->>'role'
FROM auth.users u
WHERE u.email IN ('admin@edu-cms.com', 'teacher@edu-cms.com', 'student@edu-cms.com')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;

-- Create some sample students for the demo teacher/admin to manage
INSERT INTO public.students (student_id, name, email, grade, section, phone, address, status)
VALUES 
  ('STU001', 'Alice Johnson', 'alice.johnson@school.edu', '10', 'A', '+1234567890', '123 Main St, City', 'active'),
  ('STU002', 'Bob Smith', 'bob.smith@school.edu', '10', 'A', '+1234567891', '456 Oak Ave, City', 'active'),
  ('STU003', 'Carol Davis', 'carol.davis@school.edu', '11', 'B', '+1234567892', '789 Pine Rd, City', 'active'),
  ('STU004', 'David Wilson', 'david.wilson@school.edu', '11', 'B', '+1234567893', '321 Elm St, City', 'active'),
  ('STU005', 'Eva Brown', 'eva.brown@school.edu', '12', 'C', '+1234567894', '654 Maple Dr, City', 'active')
ON CONFLICT (student_id) DO NOTHING;

-- Create a sample announcement from the admin
INSERT INTO public.announcements (title, content, category, author_id, priority, is_published)
SELECT 
  'Welcome to EduCMS Demo',
  'This is a sample announcement to demonstrate the system. You can create, edit, and manage announcements through the admin panel.',
  'general',
  u.id,
  'medium',
  true
FROM auth.users u
WHERE u.email = 'admin@edu-cms.com'
ON CONFLICT DO NOTHING;