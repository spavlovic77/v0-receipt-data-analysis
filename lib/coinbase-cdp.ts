"use server"

/**
 * Coinbase Developer Platform (CDP) Wallet Integration
 * Using official @coinbase/cdp-sdk for wallet management
 */

import { CdpClient } from "@coinbase/cdp-sdk"

let cdpClientInstance: CdpClient | null = null

/**
 * Get or create CDP client instance
 */
function getCDPClient(): CdpClient {
  if (cdpClientInstance) {
    return cdpClientInstance
  }

  const apiKeyId = process.env.CDP_API_KEY_ID // Corrected environment variable name
  const apiKeySecret = process.env.CDP_API_KEY_SECRET // Corrected environment variable name
  const walletSecret = process.env.CDP_WALLET_SECRET // New environment variable for wallet secret

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    throw new Error(
      "CDP API credentials not configured. Please set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET",
    )
  }

  console.log("[v0] Initializing CDP SDK")
  console.log("[v0] API Key ID:", apiKeyId)

  try {
    cdpClientInstance = new CdpClient({
      apiKeyId: apiKeyId,
      apiKeySecret: apiKeySecret,
      walletSecret: walletSecret, // Added walletSecret to the initialization
    })

    console.log("[v0] CDP SDK initialized successfully")
  } catch (error) {
    console.error("[v0] Failed to initialize CDP SDK:", error)
    throw error
  }

  return cdpClientInstance
}

interface CDPAccountData {
  accountId: string
  networkId: string
  address: string
}

/**
 * Create a new CDP EVM account for a user
 */
export async function createCDPWallet(networkId = "base-sepolia"): Promise<CDPAccountData | null> {
  try {
    console.log("[v0] Creating CDP EVM account on network:", networkId)

    const cdp = getCDPClient()

    const account = await cdp.evm.createAccount({
      name: `user-account-${Date.now()}`,
    })

    console.log("[v0] CDP account created")
    console.log("[v0] Account address:", account.address)

    return {
      accountId: account.address, // Using address as unique identifier
      networkId: networkId,
      address: account.address,
    }
  } catch (error: any) {
    console.error("[v0] Error creating CDP account:", error)
    console.error("[v0] Error details:", {
      message: error?.message,
      stack: error?.stack,
    })
    return null
  }
}

/**
 * Sign a message using a CDP account
 */
export async function signMessageWithCDPWallet(accountAddress: string, message: string): Promise<string | null> {
  try {
    console.log("[v0] Signing message with CDP account:", accountAddress)

    const cdp = getCDPClient()

    const account = await cdp.evm.getOrCreateAccount({
      name: `user-account-${accountAddress}`,
    })

    // Sign the message using the account
    const signature = await account.signMessage(message)

    console.log("[v0] Message signed successfully")
    console.log("[v0] Signature:", signature)

    return signature
  } catch (error) {
    console.error("[v0] Error signing message with CDP account:", error)
    return null
  }
}

/**
 * Get account information
 */
export async function getCDPAccount(accountAddress: string): Promise<CDPAccountData | null> {
  try {
    const cdp = getCDPClient()

    const account = await cdp.evm.getOrCreateAccount({
      name: `user-account-${accountAddress}`,
    })

    if (!account) {
      return null
    }

    return {
      accountId: account.address,
      networkId: "base-sepolia",
      address: account.address,
    }
  } catch (error) {
    console.error("[v0] Error getting CDP account:", error)
    return null
  }
}
