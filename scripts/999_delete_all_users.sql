-- Script to delete all users and their related data
-- Run this script in Supabase SQL Editor

-- Step 1: Delete all scanned receipts (child table)
DELETE FROM public.scanned_receipts;

-- Step 2: Delete all wallets (child table)
DELETE FROM public.wallets;

-- Step 3: Delete all users from public.users
DELETE FROM public.users;

-- Step 4: Delete all users from auth.users (this will cascade to auth-related tables)
DELETE FROM auth.users;

-- Verify deletion
SELECT 'Users deleted' as status, 
       (SELECT COUNT(*) FROM public.users) as public_users_count,
       (SELECT COUNT(*) FROM auth.users) as auth_users_count,
       (SELECT COUNT(*) FROM public.wallets) as wallets_count,
       (SELECT COUNT(*) FROM public.scanned_receipts) as receipts_count;
