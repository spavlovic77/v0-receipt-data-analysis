import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ensureUserWallet } from "@/app/actions/wallet-actions"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] OAuth callback received")
  console.log("[v0] Code:", code ? "present" : "missing")

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log("[v0] Exchange code result:", {
      hasUser: !!data?.user,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      error: error?.message,
    })

    if (error) {
      console.error("[v0] OAuth error:", error)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`)
    }

    if (data?.user) {
      console.log("[v0] Creating user record and wallet for:", data.user.email)

      try {
        const walletResult = await ensureUserWallet()
        console.log("[v0] ensureUserWallet result:", walletResult)

        if (!walletResult.success) {
          console.error("[v0] Failed to ensure wallet:", walletResult.error)
          // Continue anyway - user is logged in, wallet can be created later
        } else {
          console.log("[v0] User and wallet ready:", walletResult.wallet?.address)
        }
      } catch (err) {
        console.error("[v0] Exception in ensureUserWallet:", err)
        // Continue anyway
      }
    }
  }

  console.log("[v0] OAuth complete, redirecting to home")
  return NextResponse.redirect(requestUrl.origin)
}
