"use server"

import { createClient } from "@/lib/supabase/server"
import { createUserWallet } from "@/lib/cdp-wallet"

/**
 * Create wallet for user - references auth.users directly
 */
export async function createWalletForUser(userId: string): Promise<{
  success: boolean
  wallet?: {
    id: string
    address: string
    accountId: string
  }
  error?: string
}> {
  try {
    console.log("[v0] createWalletForUser called for userId:", userId)
    const supabase = await createClient()

    // Check if wallet already exists
    const { data: existingWallet } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()

    if (existingWallet) {
      console.log("[v0] Wallet already exists:", existingWallet.default_address)
      return {
        success: true,
        wallet: {
          id: existingWallet.id,
          address: existingWallet.default_address,
          accountId: existingWallet.wallet_id,
        },
      }
    }

    // Create new CDP wallet
    console.log("[v0] Creating new CDP wallet...")
    const { address, accountId } = await createUserWallet()
    console.log("[v0] CDP wallet created:", address)

    // Save to database
    const { data: newWallet, error: insertError } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
        wallet_id: accountId,
        network_id: "base-sepolia",
        default_address: address,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error saving wallet:", insertError)
      return { success: false, error: `Failed to save wallet: ${insertError.message}` }
    }

    console.log("[v0] Wallet saved to database successfully")
    return {
      success: true,
      wallet: {
        id: newWallet.id,
        address: newWallet.default_address,
        accountId: newWallet.wallet_id,
      },
    }
  } catch (error) {
    console.error("[v0] Error in createWalletForUser:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating wallet",
    }
  }
}

/**
 * Ensure user has a wallet (simplified - no user record needed)
 */
export async function ensureUserWallet(): Promise<{
  success: boolean
  wallet?: {
    id: string
    address: string
    accountId: string
  }
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    return await createWalletForUser(user.id)
  } catch (error) {
    console.error("[v0] Error in ensureUserWallet:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get user's wallet information
 */
export async function getUserWallet() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data: wallet, error: fetchError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (fetchError) {
      return { success: false, error: "Failed to fetch wallet" }
    }

    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }

    return {
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.default_address,
        accountId: wallet.wallet_id,
        networkId: wallet.network_id,
        createdAt: wallet.created_at,
      },
    }
  } catch (error) {
    console.error("[v0] Error getting user wallet:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
