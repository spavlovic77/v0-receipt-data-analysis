import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createUserProfile } from "@/app/actions/create-user-profile"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] OAuth callback - code present:", !!code)
  console.log("[v0] OAuth callback - origin:", requestUrl.origin)

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] OAuth exchange error:", error.message)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`)
    }

    if (data?.user) {
      console.log("[v0] User authenticated successfully!")
      console.log("[v0] User ID:", data.user.id)
      console.log("[v0] User email:", data.user.email)
      console.log("[v0] Session created:", !!data.session)

      try {
        const profileResult = await createUserProfile()
        if (profileResult.success) {
          console.log("[v0] User profile created successfully")
        } else {
          console.error("[v0] Profile creation failed:", profileResult.error)
        }
      } catch (err) {
        console.error("[v0] Profile creation error:", err)
      }
    }
  }

  console.log("[v0] Redirecting to:", requestUrl.origin)
  return NextResponse.redirect(requestUrl.origin)
}
