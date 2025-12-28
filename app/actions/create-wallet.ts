"use server"

import { createClient } from "@/lib/supabase/server"
import { createUserWallet } from "@/lib/cdp-wallet"

export async function createWalletForUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Nie ste prihlásený" }
  }

  console.log("[v0] Creating wallet for user:", user.email)

  // Check if wallet already exists
  const { data: existingWallet } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

  if (existingWallet) {
    console.log("[v0] Wallet already exists")
    return {
      success: true,
      wallet: existingWallet,
      alreadyExists: true,
    }
  }

  try {
    // Create CDP wallet
    console.log("[v0] Creating CDP wallet...")
    const cdpWallet = await createUserWallet(user.id, user.email!)

    if (!cdpWallet) {
      throw new Error("Failed to create CDP wallet")
    }

    console.log("[v0] CDP wallet created:", cdpWallet.address)

    // Save wallet to database
    const { data: wallet, error: dbError } = await supabase
      .from("wallets")
      .insert({
        user_id: user.id,
        wallet_id: cdpWallet.accountId,
        default_address: cdpWallet.address,
        network_id: cdpWallet.networkId,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log("[v0] Wallet saved to database")

    return {
      success: true,
      wallet,
      alreadyExists: false,
    }
  } catch (error) {
    console.error("[v0] Error creating wallet:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Nepodarilo sa vytvoriť peňaženku",
    }
  }
}
