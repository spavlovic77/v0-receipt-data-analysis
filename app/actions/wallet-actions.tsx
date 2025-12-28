"use server"

import { createClient } from "@/lib/supabase/server"
import { createUserWallet } from "@/lib/cdp-wallet"

export async function ensureUserWallet() {
  console.log("[v0] ensureUserWallet: Starting wallet creation process")

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] ensureUserWallet: No authenticated user found", userError)
      return { success: false, error: "Používateľ nie je prihlásený" }
    }

    console.log("[v0] ensureUserWallet: User authenticated", { userId: user.id, email: user.email })

    console.log("[v0] ensureUserWallet: Checking if user exists in public.users")
    const { data: existingUser } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle()

    if (!existingUser) {
      console.log("[v0] ensureUserWallet: User not found in public.users, creating...")
      const { error: insertError } = await supabase.from("users").insert({ id: user.id, email: user.email })

      if (insertError && insertError.code !== "23505") {
        console.error("[v0] ensureUserWallet: Error creating user record:", insertError)
        return { success: false, error: "Chyba pri vytváraní používateľského záznamu" }
      }

      console.log("[v0] ensureUserWallet: User record created, waiting 500ms for propagation")
      await new Promise((resolve) => setTimeout(resolve, 500))
    } else {
      console.log("[v0] ensureUserWallet: User exists in public.users")
    }

    console.log("[v0] ensureUserWallet: Checking if wallet already exists")
    const { data: existingWallet } = await supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle()

    if (existingWallet) {
      console.log("[v0] ensureUserWallet: Wallet already exists", { walletId: existingWallet.wallet_id })
      return { success: true, wallet: existingWallet }
    }

    console.log("[v0] ensureUserWallet: No wallet found, creating new wallet...")

    let walletData = null
    let lastError = null
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[v0] ensureUserWallet: CDP wallet creation attempt ${attempt}/${maxRetries}`)
        walletData = await createUserWallet()
        console.log("[v0] ensureUserWallet: CDP wallet created successfully", {
          accountId: walletData.accountId,
          address: walletData.address,
        })
        break
      } catch (error) {
        lastError = error
        console.error(`[v0] ensureUserWallet: CDP creation attempt ${attempt} failed:`, error)
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 500
          console.log(`[v0] ensureUserWallet: Waiting ${waitTime}ms before retry...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }
    }

    if (!walletData) {
      console.error("[v0] ensureUserWallet: All CDP creation attempts failed")
      return {
        success: false,
        error: `Vytvorenie peňaženky zlyhalo po ${maxRetries} pokusoch: ${lastError instanceof Error ? lastError.message : "Neznáma chyba"}`,
      }
    }

    console.log("[v0] ensureUserWallet: Saving wallet to database")
    const { data: newWallet, error: walletError } = await supabase
      .from("wallets")
      .insert({
        user_id: user.id,
        wallet_id: walletData.accountId,
        default_address: walletData.address,
        network_id: "base-sepolia",
      })
      .select()
      .single()

    if (walletError) {
      console.error("[v0] ensureUserWallet: Error saving wallet to database:", walletError)
      return { success: false, error: `Chyba pri ukladaní peňaženky: ${walletError.message}` }
    }

    console.log("[v0] ensureUserWallet: Wallet creation complete!", { walletId: newWallet.wallet_id })
    return { success: true, wallet: newWallet }
  } catch (error) {
    console.error("[v0] ensureUserWallet: Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neočakávaná chyba pri vytváraní peňaženky",
    }
  }
}
