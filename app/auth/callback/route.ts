import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] OAuth callback - code present:", !!code)

  if (code) {
    const supabase = await createClient()

    // The exchangeCodeForSession method sets the correct cookies via the server client
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] OAuth exchange error:", error.message)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`)
    }

    if (data?.session) {
      console.log("[v0] OAuth callback - User authenticated:", data.user?.email)

      // Redirect to home with new_login flag
      const redirectUrl = new URL(requestUrl.origin)
      redirectUrl.searchParams.set("new_login", "true")
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(requestUrl.origin)
}
