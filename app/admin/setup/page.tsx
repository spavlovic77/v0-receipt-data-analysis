"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

const RESET_SQL = `-- RESET DATABASE COMPLETELY
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
CREATE INDEX idx_receipts_receipt_id ON public.scanned_receipts(receipt_id);`

export default function SetupPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Database Setup</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Run this SQL script in your Supabase SQL Editor to reset and create the database
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            This script creates a simplified database with only wallets and scanned_receipts tables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                1
              </span>
              Open Supabase Dashboard
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Go to your Supabase project dashboard at{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                supabase.com/dashboard
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                2
              </span>
              Open SQL Editor
            </h3>
            <p className="text-sm text-muted-foreground ml-8">Navigate to: SQL Editor (left sidebar) → New Query</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                3
              </span>
              Copy and Run Script
            </h3>
            <p className="text-sm text-muted-foreground ml-8 mb-2">
              Copy the SQL script below and paste it into the SQL Editor, then click Run
            </p>

            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-96">{RESET_SQL}</pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-background"
                onClick={() => {
                  navigator.clipboard.writeText(RESET_SQL)
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                4
              </span>
              Test Login
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              After running the script, try logging in with Google. Your wallet will be created automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What This Creates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Wallets Table</p>
              <p className="text-sm text-muted-foreground">
                Stores Coinbase wallet info, linked directly to auth.users
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Scanned Receipts Table</p>
              <p className="text-sm text-muted-foreground">Stores receipt data for KREDIT token minting</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Row Level Security</p>
              <p className="text-sm text-muted-foreground">Users can only see and modify their own data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
