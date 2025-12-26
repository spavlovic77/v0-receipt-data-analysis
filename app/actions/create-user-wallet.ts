"use server"

import { createClient } from "@/lib/supabase/server"
import { createCDPWallet } from "@/lib/coinbase-cdp"

/**
 * Create a Coinbase CDP wallet for a user
 * This is called automatically after user registration/login
 */
export async function createUserWallet(userId: string) {
  try {
    const supabase = await createClient()

    console.log("[v0] Creating CDP wallet for user:", userId)

    // Check if user already has a wallet
    const { data: existingWallet } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()

    if (existingWallet) {
      console.log("[v0] User already has a wallet:", existingWallet.wallet_id)
      return { success: true, wallet: existingWallet }
    }

    const cdpAccount = await createCDPWallet("base-sepolia")

    if (!cdpAccount) {
      console.error("[v0] Failed to create CDP account")
      return { success: false, error: "Failed to create wallet" }
    }

    const { data: wallet, error } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
        wallet_id: cdpAccount.accountId,
        network_id: cdpAccount.networkId,
        default_address: cdpAccount.address,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving wallet to database:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Wallet created and saved:", wallet.wallet_id)
    return { success: true, wallet }
  } catch (error) {
    console.error("[v0] Error in createUserWallet:", error)
    return { success: false, error: "Unknown error" }
  }
}

/**
 * Get user's wallet information
 */
export async function getUserWallet(userId: string) {
  try {
    const supabase = await createClient()

    const { data: wallet, error } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()

    if (error) {
      console.error("[v0] Error fetching wallet:", error)
      return null
    }

    return wallet
  } catch (error) {
    console.error("[v0] Error in getUserWallet:", error)
    return null
  }
}
