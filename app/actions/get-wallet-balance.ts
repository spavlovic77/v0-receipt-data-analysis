"use server"

import { createClient } from "@/lib/supabase/server"
import { getWalletBalance } from "@/lib/cdp-wallet"

export async function getUserWalletBalance() {
  try {
    console.log("[v0] getUserWalletBalance: Starting...")
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] getUserWalletBalance: User check", { hasUser: !!user, authError })

    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    console.log("[v0] getUserWalletBalance: Fetching wallet for user:", user.id)

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log("[v0] getUserWalletBalance: Wallet query result", {
      hasWallet: !!wallet,
      walletError,
      wallet: wallet ? { id: wallet.id, address: wallet.default_address, accountId: wallet.wallet_id } : null,
    })

    if (walletError || !wallet) {
      return { success: false, error: "Wallet not found. Try scanning a receipt first." }
    }

    console.log("[v0] getUserWalletBalance: Getting balance for wallet:", {
      accountId: wallet.wallet_id,
      networkId: wallet.network_id,
    })
    const balance = await getWalletBalance(wallet.wallet_id, wallet.network_id)
    console.log("[v0] getUserWalletBalance: Balance retrieved:", balance)

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
