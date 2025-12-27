"use server"

import { createClient } from "@/lib/supabase/server"
import { getWalletBalance } from "@/lib/cdp-wallet"

export async function getUserWalletBalance() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (walletError || !wallet) {
      return { success: false, error: "Wallet not found" }
    }

    const balance = await getWalletBalance(wallet.wallet_id)

    return {
      success: true,
      balance: balance.toString(),
      address: wallet.default_address,
      networkId: wallet.network_id,
    }
  } catch (error) {
    console.error("[v0] Error getting wallet balance:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
