-- Create wallets table to store Coinbase CDP wallet information
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wallet_id text not null unique, -- CDP Wallet ID
  network_id text not null default 'base-sepolia',
  default_address text not null, -- Primary wallet address
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one wallet per user
  constraint wallets_user_id_unique unique (user_id)
);

-- Enable Row Level Security
alter table public.wallets enable row level security;

-- RLS Policies: Users can only see and modify their own wallet
create policy "wallets_select_own"
  on public.wallets for select
  using (auth.uid() = user_id);

create policy "wallets_insert_own"
  on public.wallets for insert
  with check (auth.uid() = user_id);

create policy "wallets_update_own"
  on public.wallets for update
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_wallets_wallet_id on public.wallets(wallet_id);
create index if not exists idx_wallets_default_address on public.wallets(default_address);

-- Add trigger to update updated_at timestamp
create trigger update_wallets_updated_at
  before update on public.wallets
  for each row
  execute function public.update_updated_at_column();
