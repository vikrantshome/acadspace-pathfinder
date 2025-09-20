-- Create default user for testing
-- Note: This directly inserts into auth.users which should only be done for development/testing

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'vikrant@acadspace.org',
  '$2a$10$rOHmkwJ9H7ZGlAtadNFz0.ND9n.xW0u6K/0/KOXHqgfhIm8WCp1cK', -- bcrypt hash of '1234'
  NOW(),
  NOW(), 
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Vikrant Test User"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Confirm the existing user's email as well for easier testing
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'vikrantshome@gmail.com' AND email_confirmed_at IS NULL;

-- Create profile for the default user if it doesn't exist
INSERT INTO public.profiles (
  user_id,
  full_name,
  school_name,
  grade,
  board
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Vikrant Test User',
  'Demo School',
  12,
  'CBSE'
) ON CONFLICT (user_id) DO NOTHING;