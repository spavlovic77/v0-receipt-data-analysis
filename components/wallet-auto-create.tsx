"use client"

import { useEffect, useState } from "react"
import { ensureUserWallet } from "@/app/actions/wallet-actions"
import { useRouter } from "next/navigation"

export function WalletAutoCreate() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const checkAndCreateWallet = async () => {
      if (isCreating) return

      setIsCreating(true)
      console.log("[v0] Auto-checking wallet...")

      const result = await ensureUserWallet()

      if (result.success && result.wallet) {
        console.log("[v0] Wallet ready:", result.wallet.address)
        // Refresh the page to show the wallet balance
        router.refresh()
      } else if (result.error) {
        console.log("[v0] Wallet check result:", result.error)
      }

      setIsCreating(false)
    }

    checkAndCreateWallet()
  }, [router, isCreating])

  // This component doesn't render anything
  return null
}
