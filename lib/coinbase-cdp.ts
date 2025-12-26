"use server"

/**
 * Coinbase Developer Platform (CDP) Wallet Integration
 * Using official @coinbase/cdp-sdk for wallet management
 */

import { Coinbase, Wallet } from "@coinbase/coinbase-sdk"

let coinbaseInstance: Coinbase | null = null

/**
 * Get or create Coinbase SDK instance
 */
function getCoinbaseClient(): Coinbase {
  if (coinbaseInstance) {
    return coinbaseInstance
  }

  const apiKeyName = process.env.CDP_API_KEY_NAME
  const privateKey = process.env.CDP_PRIVATE_KEY

  if (!apiKeyName || !privateKey) {
    throw new Error("CDP API credentials not configured")
  }

  console.log("[v0] Initializing Coinbase CDP SDK")

  // Initialize with credentials
  coinbaseInstance = Coinbase.configureFromJson({
    apiKeyName,
    privateKey,
  })

  return coinbaseInstance
}

interface CDPWalletData {
  walletId: string
  networkId: string
  defaultAddress: string
}

/**
 * Create a new CDP wallet for a user
 */
export async function createCDPWallet(networkId = "base-sepolia"): Promise<CDPWalletData | null> {
  try {
    console.log("[v0] Creating CDP wallet on network:", networkId)

    const coinbase = getCoinbaseClient()

    // Create a new wallet
    const wallet = await Wallet.create({ networkId })

    console.log("[v0] CDP wallet created:", wallet.getId())
    console.log("[v0] Default address:", wallet.getDefaultAddress()?.getId())

    return {
      walletId: wallet.getId() || "",
      networkId: networkId,
      defaultAddress: wallet.getDefaultAddress()?.getId() || "",
    }
  } catch (error) {
    console.error("[v0] Error creating CDP wallet:", error)
    return null
  }
}

/**
 * Sign a message using a CDP wallet
 */
export async function signMessageWithCDPWallet(walletId: string, message: string): Promise<string | null> {
  try {
    console.log("[v0] Signing message with CDP wallet:", walletId)

    const coinbase = getCoinbaseClient()

    // Import the wallet by ID (requires wallet data to be stored)
    // For now, we'll use a simpler approach - create a signature directly
    const wallet = await Wallet.fetch(walletId)

    if (!wallet) {
      console.error("[v0] Wallet not found:", walletId)
      return null
    }

    // Sign the message
    const signature = await wallet.getDefaultAddress()?.signMessage(message)

    console.log("[v0] Message signed successfully")

    return signature || null
  } catch (error) {
    console.error("[v0] Error signing message with CDP wallet:", error)
    return null
  }
}

/**
 * Get wallet information
 */
export async function getCDPWallet(walletId: string): Promise<CDPWalletData | null> {
  try {
    const coinbase = getCoinbaseClient()

    const wallet = await Wallet.fetch(walletId)

    if (!wallet) {
      return null
    }

    return {
      walletId: wallet.getId() || "",
      networkId: wallet.getNetworkId() || "base-sepolia",
      defaultAddress: wallet.getDefaultAddress()?.getId() || "",
    }
  } catch (error) {
    console.error("[v0] Error getting CDP wallet:", error)
    return null
  }
}
