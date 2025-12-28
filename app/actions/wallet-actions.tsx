"use server"

import { createClient } from "@/lib/supabase/server"
import { createUserWallet } from "@/lib/cdp-wallet"

/**
 * Create or get wallet for the current user
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

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    console.log("[v0] Ensuring wallet for user:", user.id)

    // Check if user exists in public.users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (userCheckError) {
      console.error("[v0] Error checking user:", userCheckError)
      return { success: false, error: "Failed to check user record" }
    }

    if (!existingUser) {
      console.log("[v0] User not found in public.users, creating...")

      // Create user record with proper error handling
      const { error: userInsertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email || "",
        })
        .select()
        .single()

      if (userInsertError) {
        // Check if it's a duplicate key error (race condition)
        if (userInsertError.code === "23505") {
          console.log("[v0] User already exists (race condition), continuing...")
        } else {
          console.error("[v0] Error creating user record:", userInsertError)
          return {
            success: false,
            error: "Nastala chyba pri vytváraní účtu. Prosím skúste znova.",
          }
        }
      } else {
        console.log("[v0] User record created successfully")
      }

      // Wait a moment for the database to propagate
      await new Promise((resolve) => setTimeout(resolve, 500))
    } else {
      console.log("[v0] User already exists in public.users")
    }
    // </CHANGE>

    // Check if wallet already exists
    const { data: existingWallet, error: fetchError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (fetchError) {
      console.error("[v0] Error fetching wallet:", fetchError)
      return { success: false, error: "Chyba pri načítaní peňaženky" }
    }

    // Return existing wallet if found
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

    console.log("[v0] Creating new CDP wallet...")
    let createAttempts = 0
    const maxAttempts = 3
    let cdpError: Error | null = null

    while (createAttempts < maxAttempts) {
      try {
        const { address, accountId } = await createUserWallet()

        // Save to database
        const { data: newWallet, error: insertError } = await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            wallet_id: accountId,
            network_id: "base-sepolia",
            default_address: address,
          })
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Error saving wallet to database:", insertError)

          // If FK constraint error, it means user doesn't exist
          if (insertError.code === "23503") {
            return {
              success: false,
              error: "Chyba pri vytváraní účtu. Prosím obnovte stránku a skúste znova.",
            }
          }

          return { success: false, error: "Chyba pri ukladaní peňaženky" }
        }

        console.log("[v0] Wallet created and saved successfully:", address)
        return {
          success: true,
          wallet: {
            id: newWallet.id,
            address: newWallet.default_address,
            accountId: newWallet.wallet_id,
          },
        }
      } catch (error) {
        cdpError = error instanceof Error ? error : new Error("Unknown error")
        createAttempts++
        console.error(`[v0] Attempt ${createAttempts} failed:`, error)

        if (createAttempts < maxAttempts) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * createAttempts))
        }
      }
    }

    return {
      success: false,
      error: `Chyba pri vytváraní peňaženky po ${maxAttempts} pokusoch. Prosím skúste znova.`,
    }
    // </CHANGE>
  } catch (error) {
    console.error("[v0] Error in ensureUserWallet:", error)
    return {
      success: false,
      error: "Neočakávaná chyba. Prosím skúste znova.",
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
