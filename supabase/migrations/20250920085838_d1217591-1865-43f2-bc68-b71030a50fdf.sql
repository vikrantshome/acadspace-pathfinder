-- Confirm the existing user's email for easier testing
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'vikrantshome@gmail.com' AND email_confirmed_at IS NULL;