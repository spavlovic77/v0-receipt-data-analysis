-- Insert demo user into auth.users (password: demo1234)
-- This uses a pre-hashed password for 'demo1234'
insert into auth.users (
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
  role
)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo@example.com',
  '$2a$10$rHEHzQFzPXr7YPLz/W8YLeBCxH5CjCXqJ3F5LH8f.VvGHv5Q8K8Fy',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated'
)
on conflict (id) do nothing;

-- Create corresponding user in public.users
insert into public.users (id, email)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo@example.com'
)
on conflict (id) do nothing;
