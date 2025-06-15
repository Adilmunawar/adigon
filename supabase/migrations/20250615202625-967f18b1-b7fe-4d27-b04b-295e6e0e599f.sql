
-- Create a 'profiles' table to store user-specific data that the AI can learn.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_data JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create a function to automatically update the `updated_at` timestamp on each change.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create a trigger to execute the timestamp update function whenever a profile is updated.
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security to ensure users can only access their own data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add a policy for users to view their own profile.
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Add a policy for users to create their own profile.
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add a policy for users to update their own profile.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create a function that automatically creates a profile for a new user upon registration.
CREATE OR REPLACE FUNCTION public.handle_new_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into public.profiles with an empty JSON object for the new user.
  INSERT INTO public.profiles (id, profile_data)
  VALUES (new.id, '{}'::jsonb);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function after a new user is created in auth.users.
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_creation();
