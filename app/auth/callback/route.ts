import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] OAuth callback - code present:", !!code)

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] OAuth exchange error:", error.message)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`)
    }

    if (data?.user) {
      console.log("[v0] User authenticated:", data.user.email)

      const redirectUrl = new URL(requestUrl.origin)
      redirectUrl.searchParams.set("new_login", "true")

      const response = NextResponse.redirect(redirectUrl, { status: 307 })
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
      return response
    }
  }

  const response = NextResponse.redirect(requestUrl.origin, { status: 307 })
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
  return response
}
