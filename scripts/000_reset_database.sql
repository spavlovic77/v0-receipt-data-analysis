-- RESET DATABASE COMPLETELY
-- This script drops all existing tables and recreates a clean schema
-- Run this first to start fresh

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS public.scanned_receipts CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Delete all auth users (requires service role)
DELETE FROM auth.users;

-- ============================================
-- CREATE CLEAN SCHEMA
-- ============================================

-- 1. Users table (linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  wallet_id TEXT NOT NULL,
  network_id TEXT NOT NULL DEFAULT 'base-sepolia',
  default_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets_insert_own" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);

-- 3. Scanned receipts table
CREATE TABLE public.scanned_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receipt_id TEXT NOT NULL,
  dic TEXT NOT NULL,
  signed_message TEXT NOT NULL,
  receipt_data JSONB,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scanned_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receipts_select_own" ON public.scanned_receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receipts_insert_own" ON public.scanned_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "receipts_delete_own" ON public.scanned_receipts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_receipts_user_id ON public.scanned_receipts(user_id);
CREATE INDEX idx_receipts_receipt_id ON public.scanned_receipts(receipt_id);

-- 4. Trigger to auto-create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
