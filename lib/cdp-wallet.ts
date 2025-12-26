"use server"

import { CdpClient } from "@coinbase/cdp-sdk"

/**
 * Initialize CDP Client with environment variables
 */
function getCdpClient(): CdpClient {
  const apiKeyId = process.env.CDP_API_KEY_ID
  const apiKeySecret = process.env.CDP_API_KEY_SECRET
  const walletSecret = process.env.CDP_WALLET_SECRET

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    throw new Error(
      "CDP credentials not configured. Please set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET environment variables.",
    )
  }

  console.log("[v0] Initializing CDP Client...")

  return new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret,
  })
}

/**
 * Create a new EVM wallet for a user
 * @returns Object containing wallet address and account ID
 */
export async function createUserWallet(): Promise<{
  address: string
  accountId: string
}> {
  try {
    console.log("[v0] Creating new CDP EVM account...")

    const cdp = getCdpClient()
    const account = await cdp.evm.createAccount()

    const address = account.address
    const accountId = account.id

    console.log("[v0] CDP account created successfully:", {
      address,
      accountId,
    })

    return {
      address,
      accountId,
    }
  } catch (error) {
    console.error("[v0] Error creating CDP wallet:", error)
    throw new Error(`Failed to create CDP wallet: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Sign a message using the user's CDP wallet
 * @param accountId - The CDP account ID
 * @param message - The message to sign
 * @returns The signature
 */
export async function signMessageWithWallet(accountId: string, message: string): Promise<string> {
  try {
    console.log("[v0] Signing message with CDP wallet:", { accountId })

    const cdp = getCdpClient()
    const account = await cdp.evm.getAccount(accountId)

    // Sign the message
    const signature = await account.signMessage(message)

    console.log("[v0] Message signed successfully")

    return signature
  } catch (error) {
    console.error("[v0] Error signing message:", error)
    throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Get wallet balance
 * @param accountId - The CDP account ID
 * @returns Balance information
 */
export async function getWalletBalance(accountId: string) {
  try {
    const cdp = getCdpClient()
    const account = await cdp.evm.getAccount(accountId)

    const balance = await account.getBalance()

    return balance
  } catch (error) {
    console.error("[v0] Error getting wallet balance:", error)
    throw new Error(`Failed to get wallet balance: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
