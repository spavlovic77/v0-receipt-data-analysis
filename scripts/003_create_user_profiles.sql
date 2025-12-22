-- Create user_profiles table to store personal information
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  surname text not null,
  birth_number text not null unique, -- Slovak "rodné číslo"
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one profile per user
  constraint user_profiles_user_id_unique unique (user_id)
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- RLS Policies: Users can only see and modify their own profile
create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "user_profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "user_profiles_delete_own"
  on public.user_profiles for delete
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);
create index if not exists idx_user_profiles_birth_number on public.user_profiles(birth_number);

-- Add trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.update_updated_at_column();
