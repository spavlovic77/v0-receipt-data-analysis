"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function OAuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")

    if (code && !processing) {
      setProcessing(true)
      console.log("[v0] OAuthCodeHandler - Found code in URL, exchanging for session")

      const handleOAuthCode = async () => {
        const supabase = createClient()

        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error("[v0] OAuthCodeHandler - Exchange error:", error.message)
            // Clean URL and show error
            window.history.replaceState({}, "", "/")
            router.refresh()
            return
          }

          if (data?.session) {
            console.log("[v0] OAuthCodeHandler - Session created for:", data.user?.email)
            // Clean URL and mark as new login for onboarding
            window.history.replaceState({}, "", "/?new_login=true")
            router.refresh()
          }
        } catch (err) {
          console.error("[v0] OAuthCodeHandler - Unexpected error:", err)
          window.history.replaceState({}, "", "/")
          router.refresh()
        }
      }

      handleOAuthCode()
    }
  }, [searchParams, router, processing])

  // Show nothing - this is a background handler
  return null
}
