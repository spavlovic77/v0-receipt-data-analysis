"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, Wallet } from "lucide-react"
import { createWalletForUser } from "@/app/actions/wallet-actions"
import { Button } from "@/components/ui/button"

interface OnboardingModalProps {
  userId: string
  userEmail: string
  needsOnboarding: boolean
}

type Status = "pending" | "loading" | "success" | "error"

export function OnboardingModal({ userId, userEmail, needsOnboarding }: OnboardingModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(needsOnboarding)
  const [walletStatus, setWalletStatus] = useState<Status>("pending")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (needsOnboarding && !started) {
      setStarted(true)
      startOnboarding()
    }
  }, [needsOnboarding, started])

  const startOnboarding = async () => {
    console.log("[v0] Starting onboarding for user:", userEmail)

    setWalletStatus("loading")

    console.log("[v0] Creating Coinbase wallet...")
    const walletResult = await createWalletForUser(userId)
    console.log("[v0] Wallet result:", walletResult)

    if (!walletResult.success) {
      setWalletStatus("error")
      setError(walletResult.error || "Nepodarilo sa vytvoriť peňaženku")
      return
    }

    setWalletStatus("success")
    setWalletAddress(walletResult.wallet?.address || null)
    console.log("[v0] Onboarding complete!")
  }

  const handleClose = () => {
    setOpen(false)
    router.refresh()
  }

  const handleRetry = () => {
    setError(null)
    setWalletStatus("pending")
    startOnboarding()
  }

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "pending":
        return <div className="w-6 h-6 rounded-full border-2 border-muted" />
      case "loading":
        return <Loader2 className="w-6 h-6 text-primary animate-spin" />
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />
    }
  }

  if (!needsOnboarding) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {walletStatus === "success" ? "Vitajte!" : "Nastavujem váš účet..."}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Wallet creation step */}
          <div className="flex items-center gap-4">
            {getStatusIcon(walletStatus)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Vytváram Coinbase peňaženku</span>
              </div>
              {walletStatus === "success" && walletAddress && (
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                </p>
              )}
              {walletStatus === "loading" && (
                <p className="text-sm text-muted-foreground mt-1">Toto môže trvať niekoľko sekúnd...</p>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Success message */}
          {walletStatus === "success" && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <p className="text-green-600 font-medium">Účet bol úspešne vytvorený!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Môžete začať skenovať účtenky a zbierať KREDIT tokeny.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          {error && (
            <Button variant="outline" onClick={handleRetry}>
              Skúsiť znova
            </Button>
          )}
          {(walletStatus === "success" || error) && (
            <Button onClick={handleClose}>{walletStatus === "success" ? "Začať" : "Zavrieť"}</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
