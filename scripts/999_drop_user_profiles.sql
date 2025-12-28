-- Drop user_profiles table and related objects
drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
drop policy if exists "user_profiles_delete_own" on public.user_profiles;

drop trigger if exists update_user_profiles_updated_at on public.user_profiles;

drop index if exists idx_user_profiles_user_id;
drop index if exists idx_user_profiles_birth_number;

drop table if exists public.user_profiles cascade;
