"use server"

/**
 * Coinbase Developer Platform (CDP) Wallet Integration
 *
 * This module provides functions to create and manage custodial wallets
 * for users using the Coinbase CDP Wallet API.
 */

interface CDPWalletResponse {
  wallet: {
    id: string
    network_id: string
    default_address: {
      address_id: string
      network_id: string
      public_key: string
      wallet_id: string
    }
  }
}

interface CDPSignatureResponse {
  signature: string
  signed_payload: string
}

/**
 * Create a new CDP wallet for a user
 * Uses server-signer for automated key management
 */
export async function createCDPWallet(networkId = "base-sepolia"): Promise<CDPWalletResponse | null> {
  try {
    const apiKey = process.env.CDP_API_KEY_NAME
    const privateKey = process.env.CDP_PRIVATE_KEY

    if (!apiKey || !privateKey) {
      console.error("[v0] CDP API credentials not configured")
      return null
    }

    // Create JWT token for authentication
    const token = await generateCDPToken(apiKey, privateKey)

    const response = await fetch("https://api.cdp.coinbase.com/platform/v1/wallets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: {
          network_id: networkId,
          use_server_signer: true, // Coinbase manages the keys
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] CDP wallet creation failed:", error)
      return null
    }

    const data: CDPWalletResponse = await response.json()
    console.log("[v0] CDP wallet created:", data.wallet.id)
    return data
  } catch (error) {
    console.error("[v0] Error creating CDP wallet:", error)
    return null
  }
}

/**
 * Sign a message using a CDP wallet
 */
export async function signMessageWithCDPWallet(
  walletId: string,
  addressId: string,
  message: string,
): Promise<string | null> {
  try {
    const apiKey = process.env.CDP_API_KEY_NAME
    const privateKey = process.env.CDP_PRIVATE_KEY

    if (!apiKey || !privateKey) {
      console.error("[v0] CDP API credentials not configured")
      return null
    }

    const token = await generateCDPToken(apiKey, privateKey)

    const response = await fetch(
      `https://api.cdp.coinbase.com/platform/v1/wallets/${walletId}/addresses/${addressId}/sign_message`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] CDP message signing failed:", error)
      return null
    }

    const data: CDPSignatureResponse = await response.json()
    return data.signature
  } catch (error) {
    console.error("[v0] Error signing message with CDP wallet:", error)
    return null
  }
}

/**
 * Generate JWT token for CDP API authentication
 */
async function generateCDPToken(apiKey: string, privateKey: string): Promise<string> {
  // Import JWT library dynamically
  const jwt = await import("jsonwebtoken")

  // The private key should be in PEM format with proper newlines
  // If stored as a single line with \n, we need to replace \\n with actual newlines
  let formattedKey = privateKey

  // Check if key contains escaped newlines and replace them
  if (privateKey.includes("\\n")) {
    formattedKey = privateKey.replace(/\\n/g, "\n")
  }

  // Validate PEM format
  if (!formattedKey.includes("BEGIN") || !formattedKey.includes("END")) {
    console.error("[v0] CDP private key must be in PEM format")
    console.error("[v0] Expected format: -----BEGIN EC PRIVATE KEY-----\\n...\\n-----END EC PRIVATE KEY-----")
    throw new Error("Invalid CDP private key format. Please use PEM formatted ES256 ECDSA key.")
  }

  const payload = {
    sub: apiKey,
    iss: "coinbase-cloud",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120, // 2 minutes
  }

  try {
    return jwt.default.sign(payload, formattedKey, { algorithm: "ES256" })
  } catch (error) {
    console.error("[v0] JWT signing failed:", error)
    throw new Error("Failed to sign JWT. Ensure your CDP private key is a valid ES256 ECDSA key in PEM format.")
  }
}

/**
 * Get wallet information
 */
export async function getCDPWallet(walletId: string): Promise<CDPWalletResponse | null> {
  try {
    const apiKey = process.env.CDP_API_KEY_NAME
    const privateKey = process.env.CDP_PRIVATE_KEY

    if (!apiKey || !privateKey) {
      return null
    }

    const token = await generateCDPToken(apiKey, privateKey)

    const response = await fetch(`https://api.cdp.coinbase.com/platform/v1/wallets/${walletId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error getting CDP wallet:", error)
    return null
  }
}
