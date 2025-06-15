
-- Add name and gender columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN name TEXT,
ADD COLUMN gender TEXT;

-- Remove the old generic profile_data column
ALTER TABLE public.profiles
DROP COLUMN profile_data;

-- Update the user creation function to populate the new name and gender columns
CREATE OR REPLACE FUNCTION public.handle_new_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, gender)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'gender'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
