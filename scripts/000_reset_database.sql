-- RESET DATABASE COMPLETELY
-- Simplified schema: only wallets and scanned_receipts
-- Both reference auth.users directly (no public.users table needed)

-- Drop existing tables
DROP TABLE IF EXISTS public.scanned_receipts CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop old triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Delete all auth users (requires service role)
DELETE FROM auth.users;

-- ============================================
-- CREATE CLEAN SCHEMA (NO public.users table)
-- ============================================

-- 1. Wallets table - references auth.users directly
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  wallet_id TEXT NOT NULL,
  network_id TEXT NOT NULL DEFAULT 'base-sepolia',
  default_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_own" ON public.wallets 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets_insert_own" ON public.wallets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);

-- 2. Scanned receipts table - references auth.users directly
CREATE TABLE public.scanned_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_id TEXT NOT NULL,
  dic TEXT NOT NULL,
  signed_message TEXT NOT NULL,
  receipt_data JSONB,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scanned_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receipts_select_own" ON public.scanned_receipts 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receipts_insert_own" ON public.scanned_receipts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "receipts_delete_own" ON public.scanned_receipts 
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_receipts_user_id ON public.scanned_receipts(user_id);
CREATE INDEX idx_receipts_receipt_id ON public.scanned_receipts(receipt_id);
