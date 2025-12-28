"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from "lucide-react"
import { createWalletForUser } from "@/app/actions/create-wallet"
import { useRouter } from "next/navigation"

export function CreateWalletButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateWallet = async () => {
    setIsCreating(true)
    setError(null)

    const result = await createWalletForUser()

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Nepodarilo sa vytvoriť peňaženku")
    }

    setIsCreating(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Vytvorte si krypto peňaženku</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pre ukladanie dokladov a získavanie KREDIT tokenov potrebujete Coinbase peňaženku.
            </p>
            <Button onClick={handleCreateWallet} disabled={isCreating} className="w-full sm:w-auto">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vytváram peňaženku...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Vytvoriť peňaženku
                </>
              )}
            </Button>
            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
