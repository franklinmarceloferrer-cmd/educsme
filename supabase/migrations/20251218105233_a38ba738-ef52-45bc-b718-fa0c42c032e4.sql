-- Fix handle_new_user() function with proper search_path and role validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validated_role text;
  validated_display_name text;
BEGIN
  -- Validate and sanitize role (only allow predefined values)
  validated_role := CASE 
    WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'teacher', 'student') 
    THEN NEW.raw_user_meta_data->>'role'
    ELSE 'student'
  END;
  
  -- Sanitize display_name with length limit (max 100 chars)
  validated_display_name := LEFT(
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    100
  );
  
  INSERT INTO public.profiles (user_id, display_name, email, role)
  VALUES (
    NEW.id,
    validated_display_name,
    NEW.email,
    validated_role
  );
  RETURN NEW;
END;
$$;