"use server"

import { createClient } from "@/lib/supabase/server"
import { signMessage } from "@/lib/crypto"

export async function saveScannedReceipt(receiptId: string, dic: string, receiptData: any) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("name, surname, birth_number")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) {
    return { error: "User profile not found. Please complete your profile first." }
  }

  // Get user's private key from metadata (or generate one if doesn't exist)
  let privateKey = user.user_metadata?.eth_private_key

  if (!privateKey) {
    // Generate new key pair for user
    const { generateKeyPair } = await import("@/lib/crypto")
    const keyPair = generateKeyPair()
    privateKey = keyPair.privateKey

    // Update user metadata with private key and public address
    await supabase.auth.updateUser({
      data: {
        eth_private_key: privateKey,
        eth_address: keyPair.publicKey,
      },
    })
  }

  const message = `${receiptId}:${profile.name}:${profile.surname}:${profile.birth_number}:${dic}`

  // Sign the message
  const signedMessage = signMessage(message, privateKey)

  console.log("[v0] Saving receipt:", {
    receiptId,
    dic,
    userId: user.id,
    message,
    signedMessage,
  })

  // Save to database
  const { data, error } = await supabase.from("scanned_receipts").insert({
    user_id: user.id,
    receipt_id: receiptId,
    dic: dic,
    signed_message: signedMessage,
    receipt_data: receiptData,
  })

  if (error) {
    console.error("[v0] Error saving receipt:", error)
    return { error: error.message }
  }

  return { data, signedMessage }
}
