"use server"

import { createClient } from "@/lib/supabase/server"
import { getKreditContract, getProvider } from "@/lib/kredit-contract"
import { signReceiptForKredit, eurToTokenAmount } from "@/lib/kredit-signing"

export async function mintKreditTokens(receiptId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get receipt data
    const { data: receipt, error: receiptError } = await supabase
      .from("scanned_receipts")
      .select("receipt_id, dic, receipt_data, user_id")
      .eq("receipt_id", receiptId)
      .eq("user_id", user.id)
      .single()

    if (receiptError || !receipt) {
      return { success: false, error: "Receipt not found" }
    }

    // Get user's wallet address
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("default_address")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      return { success: false, error: "Wallet not found" }
    }

    // Calculate token amount from receipt total
    const receiptTotal = receipt.receipt_data?.total || 0
    const tokenAmount = eurToTokenAmount(receiptTotal)

    console.log("[v0] Minting KREDIT:", {
      receiptId,
      receiptTotal,
      tokenAmount: tokenAmount.toString(),
      userAddress: wallet.default_address,
    })

    // Check if already minted
    const provider = getProvider()
    const contract = getKreditContract(provider)
    const alreadyMinted = await contract.isReceiptMinted(receiptId)

    if (alreadyMinted) {
      return { success: false, error: "Receipt already minted" }
    }

    // Sign the receipt
    const signerPrivateKey = process.env.KREDIT_SIGNER_PRIVATE_KEY
    if (!signerPrivateKey) {
      return { success: false, error: "Signer private key not configured" }
    }

    const signature = await signReceiptForKredit(
      receiptId,
      user.email || "unknown",
      "", // No surname needed
      "", // No birth number needed
      receipt.dic,
      tokenAmount,
      signerPrivateKey,
    )

    // Return minting data for the user to execute
    return {
      success: true,
      data: {
        receiptId,
        email: user.email,
        dic: receipt.dic,
        amount: tokenAmount.toString(),
        signature,
        userAddress: wallet.default_address,
        contractAddress: process.env.KREDIT_CONTRACT_ADDRESS,
      },
    }
  } catch (error: any) {
    console.error("[v0] Error minting KREDIT:", error)
    return { success: false, error: error.message || "Failed to mint KREDIT tokens" }
  }
}

export async function checkReceiptMinted(receiptId: string) {
  try {
    const provider = getProvider()
    const contract = getKreditContract(provider)
    const isMinted = await contract.isReceiptMinted(receiptId)
    return { success: true, isMinted }
  } catch (error: any) {
    console.error("[v0] Error checking receipt:", error)
    return { success: false, error: error.message }
  }
}

export async function getKreditBalance(address: string) {
  try {
    const provider = getProvider()
    const contract = getKreditContract(provider)
    const balance = await contract.balanceOf(address)
    return { success: true, balance: balance.toString() }
  } catch (error: any) {
    console.error("[v0] Error getting KREDIT balance:", error)
    return { success: false, error: error.message }
  }
}
