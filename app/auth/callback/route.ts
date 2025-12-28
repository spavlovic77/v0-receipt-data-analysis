import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ensureUserWallet } from "@/app/actions/wallet-actions"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] OAuth callback: Starting", { code: code ? "present" : "missing" })

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] OAuth callback: Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`)
    }

    console.log("[v0] OAuth callback: Session created", { userId: data.user?.id })

    console.log("[v0] OAuth callback: Creating wallet for OAuth user")
    const walletResult = await ensureUserWallet()

    if (!walletResult.success) {
      console.error("[v0] OAuth callback: Wallet creation failed:", walletResult.error)
    } else {
      console.log("[v0] OAuth callback: Wallet created successfully")
    }
  }
  // </CHANGE>

  // Redirect to home page
  console.log("[v0] OAuth callback: Redirecting to home")
  return NextResponse.redirect(requestUrl.origin)
}
