import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  console.log("[v0] OAuth callback - code present:", !!code)
  console.log("[v0] OAuth callback - origin:", origin)

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] OAuth exchange error:", error.message)
      return NextResponse.redirect(`${origin}?error=auth_failed`)
    }

    if (data?.session) {
      console.log("[v0] OAuth success - User:", data.user?.email)
      console.log("[v0] OAuth success - Session ID:", data.session.access_token.substring(0, 20) + "...")

      // Redirect with new_login flag - cookies are already set by Supabase SSR
      return NextResponse.redirect(`${origin}?new_login=true`)
    }
  }

  console.log("[v0] OAuth callback - no code or session, redirecting to home")
  return NextResponse.redirect(origin)
}
