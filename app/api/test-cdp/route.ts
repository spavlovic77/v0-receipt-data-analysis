import { NextResponse } from "next/server"
import { CdpClient } from "@coinbase/cdp-sdk"

export async function GET() {
  try {
    console.log("[v0] Testing CDP connection...")

    const apiKeyId = process.env.CDP_API_KEY_ID || process.env.CDP_API_KEY_NAME
    const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_PRIVATE_KEY
    const walletSecret = process.env.CDP_WALLET_SECRET

    if (!apiKeyId || !apiKeySecret || !walletSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing credentials",
          details: {
            hasApiKeyId: !!apiKeyId,
            hasApiKeySecret: !!apiKeySecret,
            hasWalletSecret: !!walletSecret,
          },
        },
        { status: 400 },
      )
    }

    console.log("[v0] Initializing CDP client...")
    const cdp = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret,
    })

    console.log("[v0] Attempting to create test account...")
    const account = await cdp.evm.createAccount()

    console.log("[v0] Account created successfully!")

    return NextResponse.json({
      success: true,
      message: "CDP connection successful",
      accountAddress: account.address,
    })
  } catch (error: any) {
    console.error("[v0] CDP test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorType: error.errorType || error.constructor.name,
        statusCode: error.statusCode,
        details: {
          message: error.message,
          stack: error.stack,
          errorLink: error.errorLink,
        },
      },
      { status: 500 },
    )
  }
}
