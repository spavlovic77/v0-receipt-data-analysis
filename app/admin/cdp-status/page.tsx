import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

async function checkCDPStatus() {
  "use server"

  const apiKeyId = process.env.CDP_API_KEY_ID || process.env.CDP_API_KEY_NAME
  const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_PRIVATE_KEY
  const walletSecret = process.env.CDP_WALLET_SECRET

  return {
    hasApiKeyId: !!apiKeyId,
    apiKeyIdLength: apiKeyId?.length || 0,
    apiKeyIdPreview: apiKeyId ? `${apiKeyId.substring(0, 8)}...${apiKeyId.substring(apiKeyId.length - 8)}` : "NOT SET",

    hasApiKeySecret: !!apiKeySecret,
    apiKeySecretLength: apiKeySecret?.length || 0,
    apiKeySecretPreview: apiKeySecret ? `${apiKeySecret.substring(0, 10)}...` : "NOT SET",

    hasWalletSecret: !!walletSecret,
    walletSecretLength: walletSecret?.length || 0,
    walletSecretPreview: walletSecret ? `${walletSecret.substring(0, 10)}...` : "NOT SET",
  }
}

export default async function CDPStatusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const status = await checkCDPStatus()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">CDP Configuration Status</h1>

        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">CDP_API_KEY_ID</h2>
            <div className="space-y-1 text-sm">
              <p>
                Status:{" "}
                <span className={status.hasApiKeyId ? "text-green-600" : "text-red-600"}>
                  {status.hasApiKeyId ? "✓ SET" : "✗ NOT SET"}
                </span>
              </p>
              <p>Length: {status.apiKeyIdLength} characters</p>
              <p>Preview: {status.apiKeyIdPreview}</p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">CDP_API_KEY_SECRET</h2>
            <div className="space-y-1 text-sm">
              <p>
                Status:{" "}
                <span className={status.hasApiKeySecret ? "text-green-600" : "text-red-600"}>
                  {status.hasApiKeySecret ? "✓ SET" : "✗ NOT SET"}
                </span>
              </p>
              <p>Length: {status.apiKeySecretLength} characters</p>
              <p>Preview: {status.apiKeySecretPreview}</p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">CDP_WALLET_SECRET</h2>
            <div className="space-y-1 text-sm">
              <p>
                Status:{" "}
                <span className={status.hasWalletSecret ? "text-green-600" : "text-red-600"}>
                  {status.hasWalletSecret ? "✓ SET" : "✗ NOT SET"}
                </span>
              </p>
              <p>Length: {status.walletSecretLength} characters</p>
              <p>Preview: {status.walletSecretPreview}</p>
            </div>
          </div>
        </div>

        <div className="border border-yellow-500 bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Expected Values:</h3>
          <ul className="text-sm space-y-1">
            <li>• API_KEY_ID should be 36 characters (UUID format)</li>
            <li>• API_KEY_SECRET should be ~88 characters (base64)</li>
            <li>• WALLET_SECRET is generated from CDP Portal</li>
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>If all three credentials are set correctly and you still get 401 errors, please verify:</p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Your API key is active in the CDP Portal</li>
            <li>Your API key has wallet creation permissions</li>
            <li>The Wallet Secret was generated for the same project</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
