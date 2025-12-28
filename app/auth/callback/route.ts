import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ensureUserWallet } from "@/app/actions/wallet-actions"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] OAuth callback received")
  console.log("[v0] Code:", code ? "present" : "missing")
  console.log("[v0] Full URL:", requestUrl.toString())

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log("[v0] Exchange code result:", {
      hasUser: !!data?.user,
      userId: data?.user?.id,
      error: error?.message,
    })

    if (!error && data?.user) {
      // Create wallet for social login user
      console.log("[v0] Calling ensureUserWallet for user:", data.user.id)
      const walletResult = await ensureUserWallet()
      console.log("[v0] Wallet creation result:", walletResult)
    }
  }

  // Redirect to home page
  console.log("[v0] Redirecting to:", requestUrl.origin)
  return NextResponse.redirect(requestUrl.origin)
}
