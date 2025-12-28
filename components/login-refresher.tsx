"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function LoginRefresher() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkLoginState = async () => {
      // If URL has ?code= it means we just came from OAuth
      const code = searchParams?.get("code")

      if (code) {
        console.log("[v0] Detected OAuth code in URL, refreshing page state...")
        // Remove the code from URL
        window.history.replaceState({}, "", "/")
        // Force router refresh to re-fetch user session
        router.refresh()
      }
    }

    checkLoginState()
  }, [router, searchParams])

  return null
}
