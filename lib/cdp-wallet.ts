"use server"

import { CdpClient } from "@coinbase/cdp-sdk"

/**
 * Initialize CDP Client with environment variables
 */
function getCdpClient(): CdpClient {
  const apiKeyId = process.env.CDP_API_KEY_ID || process.env.CDP_API_KEY_NAME
  const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_PRIVATE_KEY
  const walletSecret = process.env.CDP_WALLET_SECRET

  console.log("[v0] CDP Credentials Check:", {
    hasApiKeyId: !!apiKeyId,
    hasApiKeySecret: !!apiKeySecret,
    hasWalletSecret: !!walletSecret,
    apiKeyIdLength: apiKeyId?.length,
    apiKeySecretLength: apiKeySecret?.length,
    walletSecretLength: walletSecret?.length,
    apiKeyIdValue: apiKeyId, // Show full value for debugging
    walletSecretValue: walletSecret?.substring(0, 20) + "...", // Show prefix only
  })

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    const missing = []
    if (!apiKeyId) missing.push("CDP_API_KEY_ID or CDP_API_KEY_NAME")
    if (!apiKeySecret) missing.push("CDP_API_KEY_SECRET or CDP_PRIVATE_KEY")
    if (!walletSecret) missing.push("CDP_WALLET_SECRET")

    throw new Error(
      `CDP credentials not configured. Missing: ${missing.join(", ")}. Please set these environment variables.`,
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
 * @param address - The wallet address
 * @param networkId - The network ID (e.g., 'base-sepolia')
 * @returns Balance information
 */
export async function getWalletBalance(address: string, networkId = "base-sepolia") {
  try {
    console.log("[v0] Getting wallet balance for:", { address, networkId })

    const cdp = getCdpClient()

    const result = await cdp.evm.listTokenBalances({
      address: address,
      network: networkId,
    })

    console.log("[v0] Token balances retrieved:", result)

    // Find native ETH balance (represented by 0xEeeee... address)
    const nativeBalance = result.balances.find(
      (balance) =>
        balance.token.contractAddress?.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
        balance.token.symbol === "ETH",
    )

    if (nativeBalance) {
      // Convert from smallest unit to ETH
      const readableAmount = Number(nativeBalance.amount.amount) / Math.pow(10, nativeBalance.amount.decimals)
      console.log("[v0] Native balance (ETH):", readableAmount)

      return {
        amount: readableAmount.toString(),
        symbol: nativeBalance.token.symbol,
        decimals: nativeBalance.amount.decimals,
      }
    }

    // If no native balance found, return 0
    return {
      amount: "0",
      symbol: "ETH",
      decimals: 18,
    }
  } catch (error) {
    console.error("[v0] Error getting wallet balance:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw new Error(`Failed to get wallet balance: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
