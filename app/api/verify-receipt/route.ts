import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { receiptId, messageHash } = body

    // Validate input
    if (!receiptId || !messageHash) {
      return NextResponse.json({ error: "Missing required fields: receiptId, messageHash" }, { status: 400 })
    }

    console.log("[v0] Verifying receipt:", { receiptId, messageHash })

    // Get receipt from database
    const supabase = await createClient()
    const { data: receipt, error } = await supabase
      .from("scanned_receipts")
      .select("signed_message, user_id")
      .eq("receipt_id", receiptId)
      .single()

    if (error || !receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    // Get user's Ethereum address (public key)
    const { data: userData } = await supabase.auth.admin.getUserById(receipt.user_id)
    const ethAddress = userData.user?.user_metadata?.eth_address

    if (!ethAddress) {
      return NextResponse.json({ error: "User Ethereum address not found" }, { status: 404 })
    }

    try {
      const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), receipt.signed_message)

      const isValid = recoveredAddress.toLowerCase() === ethAddress.toLowerCase()

      console.log("[v0] Verification result:", {
        isValid,
        recoveredAddress,
        expectedAddress: ethAddress,
      })

      return NextResponse.json({
        valid: isValid,
        receiptId: receipt.receipt_id,
        ethAddress,
        timestamp: new Date().toISOString(),
      })
    } catch (verifyError) {
      console.error("[v0] Signature verification error:", verifyError)
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid signature format",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
