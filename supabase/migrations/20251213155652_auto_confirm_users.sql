/*
  # Auto-confirm Users on Signup

  ## Overview
  This migration creates a trigger that automatically confirms user emails when they sign up,
  bypassing the email confirmation requirement.

  ## Changes
  1. Create a function to auto-confirm user emails
  2. Add a trigger that runs after user insert

  ## Security
  - This allows users to sign up without email verification
  - Suitable for development or internal applications
  - Role metadata is preserved from signup data

  ## Important Notes
  - Users will be immediately active after signup
  - No email confirmation required
  - The confirmation timestamp is set to the current time
*/

-- Function to auto-confirm users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the user's email
  NEW.email_confirmed_at = now();
  NEW.confirmed_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-confirm users on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
