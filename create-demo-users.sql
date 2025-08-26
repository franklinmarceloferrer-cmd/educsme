-- Quick Demo Users Setup for EduCMS
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- First, let's check if users already exist
DO $$
BEGIN
    -- Create admin user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@edu-cms.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
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
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@edu-cms.com',
            crypt('password', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"display_name":"System Administrator","role":"admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        RAISE NOTICE 'Created admin user';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;

    -- Create teacher user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'teacher@edu-cms.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
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
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'teacher@edu-cms.com',
            crypt('password', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"display_name":"Demo Teacher","role":"teacher"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        RAISE NOTICE 'Created teacher user';
    ELSE
        RAISE NOTICE 'Teacher user already exists';
    END IF;

    -- Create student user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student@edu-cms.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
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
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'student@edu-cms.com',
            crypt('password', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"display_name":"Demo Student","role":"student"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        RAISE NOTICE 'Created student user';
    ELSE
        RAISE NOTICE 'Student user already exists';
    END IF;
END $$;

-- Create profiles for the demo users (the trigger should handle this, but let's be sure)
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

-- Add some sample data for testing
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
    'This is a sample announcement. You can now test the system with the demo accounts!',
    'general',
    u.id,
    'medium',
    true
FROM auth.users u
WHERE u.email = 'admin@edu-cms.com'
ON CONFLICT DO NOTHING;

-- Show success message
DO $$
BEGIN
    RAISE NOTICE '✅ Demo users created successfully!';
    RAISE NOTICE 'You can now sign in with:';
    RAISE NOTICE '  Admin: admin@edu-cms.com / password';
    RAISE NOTICE '  Teacher: teacher@edu-cms.com / password';
    RAISE NOTICE '  Student: student@edu-cms.com / password';
END $$;