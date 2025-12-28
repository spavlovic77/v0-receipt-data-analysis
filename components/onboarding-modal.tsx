"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, User, Wallet } from "lucide-react"
import { createUserRecord, createWalletForUser } from "@/app/actions/wallet-actions"
import { Button } from "@/components/ui/button"

interface OnboardingModalProps {
  userId: string
  userEmail: string
  isNewUser: boolean
}

type Step = "user" | "wallet" | "complete"
type Status = "pending" | "loading" | "success" | "error"

export function OnboardingModal({ userId, userEmail, isNewUser }: OnboardingModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>("user")
  const [userStatus, setUserStatus] = useState<Status>("pending")
  const [walletStatus, setWalletStatus] = useState<Status>("pending")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user just logged in via OAuth
    const isNewLogin = searchParams.get("new_login") === "true"
    if (isNewLogin && isNewUser) {
      setOpen(true)
      startOnboarding()
    }
  }, [searchParams, isNewUser])

  const startOnboarding = async () => {
    // Step 1: Create user record
    setCurrentStep("user")
    setUserStatus("loading")

    const userResult = await createUserRecord(userId, userEmail)

    if (!userResult.success) {
      setUserStatus("error")
      setError(userResult.error || "Failed to create user")
      return
    }

    setUserStatus("success")

    // Step 2: Create wallet
    setCurrentStep("wallet")
    setWalletStatus("loading")

    const walletResult = await createWalletForUser(userId)

    if (!walletResult.success) {
      setWalletStatus("error")
      setError(walletResult.error || "Failed to create wallet")
      return
    }

    setWalletStatus("success")
    setWalletAddress(walletResult.wallet?.address || null)
    setCurrentStep("complete")
  }

  const handleClose = () => {
    setOpen(false)
    // Clean up URL params
    const url = new URL(window.location.href)
    url.searchParams.delete("new_login")
    window.history.replaceState({}, "", url.pathname)
    router.refresh()
  }

  const handleRetry = () => {
    setError(null)
    setUserStatus("pending")
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {currentStep === "complete" ? "Vitajte!" : "Nastavujem váš účet..."}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Step 1: User creation */}
          <div className="flex items-center gap-4">
            {getStatusIcon(userStatus)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Vytváram používateľský účet</span>
              </div>
              {userStatus === "success" && <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>}
            </div>
          </div>

          {/* Step 2: Wallet creation */}
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
          {currentStep === "complete" && (
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
          {(currentStep === "complete" || error) && (
            <Button onClick={handleClose}>{currentStep === "complete" ? "Začať" : "Zavrieť"}</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
