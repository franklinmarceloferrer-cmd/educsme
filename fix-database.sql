-- Fix Database Schema - Run this in Supabase SQL Editor
-- This will ensure all required tables exist with proper permissions

-- Check if tables exist
DO $$
BEGIN
    -- Check and create documents table if missing
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
        CREATE TABLE public.documents (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            file_url TEXT NOT NULL,
            file_size INTEGER,
            file_type TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'academic', 'administrative', 'policy')),
            uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            is_public BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Everyone can view public documents" 
        ON public.documents 
        FOR SELECT 
        USING (is_public = true);

        CREATE POLICY "Teachers and admins can view all documents" 
        ON public.documents 
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('teacher', 'admin')
            )
        );

        CREATE POLICY "Teachers and admins can manage documents" 
        ON public.documents 
        FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('teacher', 'admin')
            )
        );
        
        RAISE NOTICE 'Created documents table';
    ELSE
        RAISE NOTICE 'Documents table already exists';
    END IF;

    -- Check and create students table if missing
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN
        CREATE TABLE public.students (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            grade TEXT NOT NULL,
            section TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Teachers and admins can view all students" 
        ON public.students 
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('teacher', 'admin')
            )
        );

        CREATE POLICY "Students can view their own record" 
        ON public.students 
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND email = students.email
            )
        );

        CREATE POLICY "Teachers and admins can manage students" 
        ON public.students 
        FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('teacher', 'admin')
            )
        );
        
        RAISE NOTICE 'Created students table';
    ELSE
        RAISE NOTICE 'Students table already exists';
    END IF;

    -- Check and create announcements table if missing
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'announcements') THEN
        CREATE TABLE public.announcements (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'urgent', 'academic', 'event')),
            author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
            is_published BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Everyone can view published announcements" 
        ON public.announcements 
        FOR SELECT 
        USING (is_published = true);

        CREATE POLICY "Teachers and admins can view all announcements" 
        ON public.announcements 
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('teacher', 'admin')
            )
        );

        CREATE POLICY "Teachers and admins can create announcements" 
        ON public.announcements 
        FOR INSERT 
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('teacher', 'admin')
            )
        );

        CREATE POLICY "Authors can update their own announcements" 
        ON public.announcements 
        FOR UPDATE 
        USING (auth.uid() = author_id);

        CREATE POLICY "Authors can delete their own announcements" 
        ON public.announcements 
        FOR DELETE 
        USING (auth.uid() = author_id);
        
        RAISE NOTICE 'Created announcements table';
    ELSE
        RAISE NOTICE 'Announcements table already exists';
    END IF;
END $$;

-- Add some sample data for testing
INSERT INTO public.students (student_id, name, email, grade, section, phone, address, status)
VALUES 
    ('STU001', 'Alice Johnson', 'alice.johnson@school.edu', '10', 'A', '+1234567890', '123 Main St', 'active'),
    ('STU002', 'Bob Smith', 'bob.smith@school.edu', '10', 'A', '+1234567891', '456 Oak Ave', 'active'),
    ('STU003', 'Carol Davis', 'carol.davis@school.edu', '11', 'B', '+1234567892', '789 Pine Rd', 'active'),
    ('STU004', 'David Wilson', 'david.wilson@school.edu', '11', 'B', '+1234567893', '321 Elm St', 'active'),
    ('STU005', 'Eva Brown', 'eva.brown@school.edu', '12', 'C', '+1234567894', '654 Maple Dr', 'active')
ON CONFLICT (student_id) DO NOTHING;

-- Create a welcome announcement
INSERT INTO public.announcements (title, content, category, author_id, priority, is_published)
SELECT 
    'Welcome to EduCMS',
    'Welcome to the Educational Content Management System! This platform helps manage students, announcements, and documents efficiently.',
    'general',
    u.id,
    'medium',
    true
FROM auth.users u
WHERE u.email = 'mauro.lima@educacao.am.gov.br'
ON CONFLICT DO NOTHING;

-- Show table status
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'students', 'announcements', 'documents')
ORDER BY tablename;