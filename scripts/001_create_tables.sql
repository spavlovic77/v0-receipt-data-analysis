-- Create users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

-- Create scanned_receipts table
create table if not exists public.scanned_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  receipt_id text not null,
  dic text not null,
  signed_message text not null,
  receipt_data jsonb,
  scanned_at timestamptz default now()
);

alter table public.scanned_receipts enable row level security;

create policy "receipts_select_own"
  on public.scanned_receipts for select
  using (auth.uid() = user_id);

create policy "receipts_insert_own"
  on public.scanned_receipts for insert
  with check (auth.uid() = user_id);

create policy "receipts_delete_own"
  on public.scanned_receipts for delete
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists idx_scanned_receipts_user_id on public.scanned_receipts(user_id);
create index if not exists idx_scanned_receipts_receipt_id on public.scanned_receipts(receipt_id);
