import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ensureUserWallet } from "@/app/actions/wallet-actions"
import { completeUserProfile } from "@/app/actions/complete-profile"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      await completeUserProfile()
      await ensureUserWallet()
    }
  }

  // Redirect to home page
  return NextResponse.redirect(requestUrl.origin)
}
