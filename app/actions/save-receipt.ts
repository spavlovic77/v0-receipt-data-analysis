"use server"

import { createClient } from "@/lib/supabase/server"

export async function saveScannedReceipt(receiptId: string, dic: string, receiptData: any) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("scanned_receipts")
    .select("id, scanned_at")
    .eq("user_id", user.id)
    .eq("receipt_id", receiptId)
    .maybeSingle()

  if (existing) {
    return {
      error: "DUPLICATE",
      message: "Tento doklad ste už naskenovali",
      scannedAt: existing.scanned_at,
    }
  }

  // Get user's wallet
  const { data: wallet } = await supabase.from("wallets").select("default_address").eq("user_id", user.id).single()

  if (!wallet) {
    return { error: "Wallet not found. Please try logging out and back in." }
  }

  const message = `${receiptId}:${user.email}:${dic}`

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
