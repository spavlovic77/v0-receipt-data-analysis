"use server"

import { createClient } from "@/lib/supabase/server"
import { getUserWallet } from "./create-user-wallet"

export async function saveScannedReceipt(receiptId: string, dic: string, receiptData: any) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const { data: existing, error: checkError } = await supabase
    .from("scanned_receipts")
    .select("id, scanned_at")
    .eq("user_id", user.id)
    .eq("receipt_id", receiptId)
    .maybeSingle()

  console.log("[v0] Duplicate check result:", { existing, checkError, receiptId })

  if (existing) {
    console.log("[v0] Receipt already scanned:", { receiptId, scannedAt: existing.scanned_at })
    return {
      error: "DUPLICATE",
      message: "Tento doklad ste už naskenovali",
      scannedAt: existing.scanned_at,
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("name, surname, birth_number")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) {
    return { error: "User profile not found. Please complete your profile first." }
  }

  const wallet = await getUserWallet(user.id)

  if (!wallet) {
    console.error("[v0] Wallet not found for user - should have been created at signup")
    return { error: "Wallet not found. Please contact support." }
  }

  const message = `${receiptId}:${profile.name}:${profile.surname}:${profile.birth_number}:${dic}`

  console.log("[v0] Saving receipt:", {
    receiptId,
    dic,
    userId: user.id,
    walletAddress: wallet.default_address,
    message,
  })

  const { data, error } = await supabase.from("scanned_receipts").insert({
    user_id: user.id,
    receipt_id: receiptId,
    dic: dic,
    signed_message: message,
    receipt_data: receiptData,
  })

  if (error) {
    console.error("[v0] Error saving receipt:", error)
    return { error: error.message }
  }

  return { data, message }
}
