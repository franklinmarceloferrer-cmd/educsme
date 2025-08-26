-- QUICK FIX: Create Demo Users for EduCMS
-- Copy this entire script and run it in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/rttarliasydfffldayui/sql

-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to safely create demo users
CREATE OR REPLACE FUNCTION create_demo_user(
    user_email TEXT,
    user_password TEXT,
    user_display_name TEXT,
    user_role TEXT
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NOT NULL THEN
        RAISE NOTICE 'User % already exists with ID %', user_email, user_id;
        RETURN user_id;
    END IF;
    
    -- Generate new user ID
    user_id := uuid_generate_v4();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_password, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('display_name', user_display_name, 'role', user_role),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Insert into profiles (in case trigger doesn't work)
    INSERT INTO public.profiles (user_id, display_name, email, role)
    VALUES (user_id, user_display_name, user_email, user_role)
    ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        role = EXCLUDED.role;
    
    RAISE NOTICE 'Created user % with ID %', user_email, user_id;
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Create the demo users
SELECT create_demo_user('admin@edu-cms.com', 'password', 'System Administrator', 'admin');
SELECT create_demo_user('teacher@edu-cms.com', 'password', 'Demo Teacher', 'teacher');
SELECT create_demo_user('student@edu-cms.com', 'password', 'Demo Student', 'student');

-- Add some sample students
INSERT INTO public.students (student_id, name, email, grade, section, phone, address, status)
VALUES 
    ('STU001', 'Alice Johnson', 'alice.johnson@school.edu', '10', 'A', '+1234567890', '123 Main St', 'active'),
    ('STU002', 'Bob Smith', 'bob.smith@school.edu', '10', 'A', '+1234567891', '456 Oak Ave', 'active'),
    ('STU003', 'Carol Davis', 'carol.davis@school.edu', '11', 'B', '+1234567892', '789 Pine Rd', 'active')
ON CONFLICT (student_id) DO NOTHING;

-- Create a welcome announcement
INSERT INTO public.announcements (title, content, category, author_id, priority, is_published)
SELECT 
    'Welcome to EduCMS Demo',
    'Demo users have been created successfully! You can now test the system.',
    'general',
    u.id,
    'medium',
    true
FROM auth.users u
WHERE u.email = 'admin@edu-cms.com'
ON CONFLICT DO NOTHING;

-- Clean up the function
DROP FUNCTION create_demo_user(TEXT, TEXT, TEXT, TEXT);

-- Final verification
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.display_name,
    p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN ('admin@edu-cms.com', 'teacher@edu-cms.com', 'student@edu-cms.com')
ORDER BY u.email;